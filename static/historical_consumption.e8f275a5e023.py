import dash
import string
import plotly.io as pio
import pandas as pd
import plotly.graph_objects as go
import dash_core_components as dcc
import dash_html_components as html
import dash.dependencies as dd
import dash_bootstrap_components as dbc
import plotly.express as px
import datetime as dt
import dateutil.relativedelta
import dash_daq as daq
from django_plotly_dash import DjangoDash


pio.templates.default = "simple_white"

# A) Function to create new essential columns


def initialise_variables():
    # Initialise some variables
    global user1
    global singapore_tariff_rate
    singapore_tariff_rate = 0.201

    # Manipulate Data

    user1 = pd.read_csv('.\\plug_mate_app\\dash_apps\\finished_apps\\user1_alldevices.csv')
    hours = []
    months = []
    years = []
    dates_AMPM = []

    for unix_time in user1['unix_time']:
        month = dt.datetime.utcfromtimestamp(unix_time).strftime('%B')
        year = dt.datetime.utcfromtimestamp(unix_time).strftime('%Y')
        date_AMPM = dt.datetime.utcfromtimestamp(unix_time).strftime('%I:%M%p')
        hour = dt.datetime.utcfromtimestamp(unix_time).strftime('%H')

        hours.append(hour)
        months.append(month)
        years.append(year)
        dates_AMPM.append(date_AMPM)

    user1['month'] = months
    user1['year'] = years
    user1['dates_AMPM'] = dates_AMPM
    user1['hours'] = hours

    user1.loc[user1.index.dropna()]

    # Start to add kWh, Costs and Device Type Caps

    # Add kWh
    kWhList = []
    for val in user1['power']:
        kWhList.append(round(val/1000, 3))

    user1['power_kWh'] = kWhList

    # Add costs
    cost = []
    for kwh in user1['power_kWh']:
        cost.append(round(kwh*singapore_tariff_rate, 3))

    user1['cost'] = cost

    # Add device type with Caps
    typecapped = []
    for type in user1['type']:
        typecapped.append(string.capwords(type))
    user1['type'] = typecapped


# Manipulate and Initialise variables for later
initialise_variables()


# B) Dash App initialisation
app = DjangoDash('historical_consumption', external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"], add_bootstrap_links=True)

# C) App Layout
app.layout = \
    html.Div([
        html.Link(
            rel='stylesheet',
            href='/static/plug_mate_app/dash_apps/finished_apps/assets/custom_style.css'
        ),  # Solution to the custom css issue
        html.Div([
            dbc.Row([
                dbc.Button('Hour', id='hour', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                           color="primary", className="mr-1"),
                dbc.Button('Day', id='day', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'}, color="primary",
                           className="mr-1"),
                dbc.Button('Week', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                           color="primary", className="mr-1"),
                dbc.Button('Month', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                           color="primary", className="mr-1"),

            ], style={'padding-top': '3%', 'margin': 'auto', 'justify-content': 'center'}
            ),
            dbc.Row([
                html.Div([
                    daq.BooleanSwitch(id='btntoggle_units',
                                      on=False, color='#e6e6e6'),
                ], style={'width': 'fit-content', })], style={'justify-content': 'center', 'margin-top': '3%'}),

            dbc.Row([
                dbc.Col([html.H4("Aggregated Energy", id='lineTitle')],
                        width=7, style={'text-align': 'center'}),
                dbc.Col([
                    html.H4("Energy Breakdown for the past 24 hrs", id='pieTitle')
                ], width=5, style={'text-align': 'center'}),
            ], style={'justify-content': 'center', 'margin': 'auto', 'padding-left': '5%', 'padding-right': '5%'}),

            dbc.Row([
                    dbc.Col([dcc.Graph(id='line-chart')], width=7),
                    dbc.Col([
                        dcc.Graph(id='pie-chart-2', style={'height': '350px'})
                    ], width=5, style={'margin-top': '3%'}),


                    ], style={'justify-content': 'center', 'margin': 'auto', 'padding-left': '5%', 'padding-right': '5%'}),
        ], style={'justify-content': 'center', 'margin-left': '0px'}),

        dcc.Interval(
            id='interval-component',
            interval=0,  # in milliseconds
            max_intervals=1
        )
    ])

# D) This callback activates upon HOUR DAY WEEK MONTH click


@app.callback([dd.Output('line-chart', 'figure'),
               dd.Output('pie-chart-2', 'figure'),
               dd.Output('lineTitle', 'children'),
               dd.Output('pieTitle', 'children')
               ],
              [dd.Input('hour', 'n_clicks'),
               dd.Input('day', 'n_clicks'),
               dd.Input('week', 'n_clicks'),
               dd.Input('month', 'n_clicks'),
               dd.Input('btntoggle_units', 'on'),
               dd.Input('line-chart', 'clickData'),
               dd.Input('interval-component', 'n_intervals')],
              [dd.State('line-chart', 'hoverData'),
               dd.State('hour', 'n_clicks_timestamp'),
               dd.State('day', 'n_clicks_timestamp'),
               dd.State('week', 'n_clicks_timestamp'),
               dd.State('month', 'n_clicks_timestamp'), ]
              )
# E) Callback Function when Day Hour Month or Week clicked
def update_graph_DayMonthYear(btn1_click, btn2_click, btn3_click, btn4_click,
                              btnkwhdollars, clickData, interval,hoverData, btn1, btn2, btn3, btn4):
    global user1
    global df3
    global df4
    global piechart
    global df_week
    global fig2
    global start
    global end
    global values_pie
    global pie_middletext

    end_date = '19/3/2020'

# F) Search for the most recent changed ID to know if hour day week or Month
    # checks the list of id that recently triggered a callback in dash.callback_context.triggered list
    changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]

    if 'hour' in changed_id:

        # Line Chart

        # Create new dataframe
        df_hour = user1

        # Get last 24 hours only

        df_hour['date'] = pd.to_datetime(df_hour['date'])
        end = end_date  # String of todays date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        mask = (df_hour['date'] == end)

        # Delete these row indexes from dataFrame
        df_hour = df_hour.loc[mask]
        df_hour.reset_index(drop=True, inplace=True)

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'dates_AMPM': 'first'}  # sum power when combining rows.
        df_hour = df_hour.groupby(
            ['date', 'hours'], as_index=False).aggregate(aggregation_functions)
        df_hour.reset_index(drop=True, inplace=True)

        # Optional Convert to %d/%m/%Y
        df_hour['date'] = df_hour['date'].dt.strftime('%d/%m/%Y')

        # Pie Chart

        # Create new instance of df
        df_hour_pie = user1

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'dates_AMPM': 'first'}  # sum power when combining rows.
        df_hour_pie = df_hour_pie.groupby(
            ['date', 'hours', 'type'], as_index=False).aggregate(aggregation_functions)
        df_hour_pie.reset_index(drop=True, inplace=True)

        # Get last 24 hours only

        df_hour_pie['date'] = pd.to_datetime(df_hour_pie['date'])
        end = end_date  # String of todays date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        mask = (df_hour_pie['date'] == end)
        # Delete these row indexes from dataFrame
        df_hour_pie = df_hour_pie.loc[mask]
        df_hour_pie.reset_index(drop=True, inplace=True)

        # Optional Convert to %d/%m/%Y
        df_hour_pie['date'] = df_hour_pie['date'].dt.strftime('%d/%m/%Y')

        # Pie Chart values
        values_pie = df_hour_pie['power_kWh']
        pie_middletext = 'the Past 24 Hrs'

        # For changing units
        df3 = df_hour
        df4 = df_hour_pie

    elif 'day' in changed_id:

        # Line Chart

        # Create new dataframe
        df_day = user1

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum', 'cost': 'sum'}  # sum power when combining rows.
        df_day = df_day.groupby(['date'], as_index=False).aggregate(
            aggregation_functions)
        df_day.reset_index(drop=True, inplace=True)

        # Get last 7 days
        # Get names of indexes for which column Date only has values 7 days before 29/2/2020
        df_day['date'] = pd.to_datetime(df_day['date'])
        end = end_date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        start = end - dt.timedelta(7)
        mask = (df_day['date'] > start) & (df_day['date'] <= end)
        # Delete these row indexes from dataFrame
        df_day = df_day.loc[mask]
        df_day.reset_index(drop=True, inplace=True)

        # Optional Convert to %d/%m/%Y
        df_day['date'] = df_day['date'].dt.strftime('%d/%m/%Y')

        # Pie Chart

        # Create new instance of df
        df_day_pie = user1

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_day_pie = df_day_pie.groupby(
            ['date', 'type'], as_index=False).aggregate(aggregation_functions)
        df_day_pie.reset_index(drop=True, inplace=True)

        # Get names of indexes for which column Date only has values 7 days before 29/2/2020
        df_day_pie['date'] = pd.to_datetime(df_day_pie['date'])
        end = end_date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        start = end - dt.timedelta(7)
        mask = (df_day_pie['date'] > start) & (df_day_pie['date'] <= end)
        # Delete these row indexes from dataFrame
        df_day_pie = df_day_pie.loc[mask]
        df_day_pie.reset_index(drop=True, inplace=True)

        # Aggregate data based on type for past 7 days

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_day_pie = df_day_pie.groupby(
            ['type'], as_index=False).aggregate(aggregation_functions)
        df_day_pie.reset_index(drop=True, inplace=True)

        # Pie Chart
        values_pie = df_day_pie['power_kWh']
        pie_middletext = 'Last 7 days'

        # For changing units
        df3 = df_day
        df4 = df_day_pie

    elif 'week' in changed_id:

        # 1. Filter past 4 weeks using timedelta 28 days
        # For Line Chart

        # Create new dataframe
        df_week = user1

        # Get names of indexes for which column Date only has values 4 weeks before 29/2/2020
        df_week['date'] = pd.to_datetime(df_week['date'])
        end = end_date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        start = end - dt.timedelta(28)
        mask = (df_week['date'] > start) & (df_week['date'] <= end)

        # Delete these row indexes from dataFrame
        df_week = df_week.loc[mask]
        df_week.reset_index(drop=True, inplace=True)

        # 2. Append new column called Week

        # Df_week for later
        df_week['week'] = ''

        # Initiate df for line
        df_week_line = df_week

        # 3. Label weeks 1, 2, 3, 4 based on start date

        start = end - dt.timedelta(7)
        # If datetime > start & datetime <= end ==> Week 1
        # idx = df.index[df['BoolCol']] # Search for indexes of value in column
        # df.loc[idx] # Get rows with all the columns
        df_week.loc[(df_week['date'] > start) & (
            df_week['date'] <= end), ['week']] = "{} - {}".format(start.strftime('%d %b'), end.strftime('%d %b'))
        df_week.loc[(df_week['date'] > (start-dt.timedelta(7))) &
                    (df_week['date'] <= (end-dt.timedelta(7))), ['week']] = "{} - {}".format((start - dt.timedelta(7)).strftime('%d %b'), (end - dt.timedelta(7)).strftime('%d %b'))
        df_week.loc[(df_week['date'] > (start-dt.timedelta(14))) &
                    (df_week['date'] <= (end-dt.timedelta(14))), ['week']] = "{} - {}".format((start - dt.timedelta(14)).strftime('%d %b'), (end - dt.timedelta(14)).strftime('%d %b'))
        df_week.loc[(df_week['date'] > (start-dt.timedelta(21))) &
                    (df_week['date'] <= (end-dt.timedelta(21))), ['week']] = "{} - {}".format((start - dt.timedelta(21)).strftime('%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))

        df_week.reset_index(drop=True, inplace=True)

        df_week_line.loc[(df_week['date'] > start) & (
            df_week['date'] <= end), ['week']] = "Week 0"
        df_week_line.loc[(df_week['date'] > (start-dt.timedelta(7))) &
                         (df_week['date'] <= (end-dt.timedelta(7))), ['week']] = "Week -1"
        df_week_line.loc[(df_week['date'] > (start-dt.timedelta(14))) &
                         (df_week['date'] <= (end-dt.timedelta(14))), ['week']] = "Week -2"
        df_week_line.loc[(df_week['date'] > (start-dt.timedelta(21))) &
                         (df_week['date'] <= (end-dt.timedelta(21))), ['week']] = "Week -3"

        df_week_line.reset_index(drop=True, inplace=True)

        # 4. Aggregate by Week

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'date': 'first'}  # sum power when combining rows.
        df_week_line = df_week_line.groupby(
            ['week'], as_index=False).aggregate(aggregation_functions)
        df_week_line.reset_index(drop=True, inplace=True)

        # 5. Generate Graphs

        # Create new variable

        # For Pie Chart
        df_week_pie = df_week  # already filtered past 4 weeks

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_week_pie = df_week_pie.groupby(
            ['type'], as_index=False).aggregate(aggregation_functions)
        df_week_pie.reset_index(drop=True, inplace=True)

        values_pie = df_week_pie['power_kWh']
        pie_middletext = 'the Past 4 Weeks'

        # For changing units
        df3 = df_week_line
        df4 = df_week_pie

    elif 'month' in changed_id:

        # 1) For Line Chart
        # Create new dataframe
        df_month = user1

        # Aggregate data by date first before filtering months

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month = df_month.groupby(
            ['date'], as_index=False).aggregate(aggregation_functions)
        df_month.reset_index(drop=True, inplace=True)

        # Filter data for Last 12 months
        # Get names of indexes for which column Date only has values 12 months before 1/2/2020
        df_month['date'] = pd.to_datetime(df_month['date'])
        end = end_date
        end_first_day_date = dt.datetime.strptime(
            end, '%d/%m/%Y').replace(day=1)

        start = end_first_day_date - \
            dateutil.relativedelta.relativedelta(months=12)
        mask = (df_month['date'] > start) & (df_month['date'] <= end)
        # Delete these row indexes from dataFrame
        df_month = df_month.loc[mask]
        df_month.reset_index(drop=True, inplace=True)

        # Aggregate Data into Months based on last 12 months

        aggregation_functions = {'power': 'sum', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month = df_month.groupby(
            ['month'], as_index=False).aggregate(aggregation_functions)
        df_month.reset_index(drop=True, inplace=True)

        # 2) For Pie Chart

        df_month_pie = user1

        # Aggregate data by date first before filtering months

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month_pie = df_month_pie.groupby(
            ['date', 'type'], as_index=False).aggregate(aggregation_functions)
        df_month_pie.reset_index(drop=True, inplace=True)

        # Filter data for Last 12 months
        # Get names of indexes for which column Date only has values 12 months before 1/2/2020
        df_month_pie['date'] = pd.to_datetime(df_month_pie['date'])
        end = end_date
        end_first_day_date = dt.datetime.strptime(
            end, '%d/%m/%Y').replace(day=1)

        start = end_first_day_date - \
            dateutil.relativedelta.relativedelta(months=12)
        mask = (df_month_pie['date'] > start) & (df_month_pie['date'] <= end)
        # Delete these row indexes from dataFrame
        df_month_pie = df_month_pie.loc[mask]
        df_month_pie.reset_index(drop=True, inplace=True)

        # Aggregate Data into Months based on last 12 months

        aggregation_functions = {'power': 'sum', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month_pie = df_month_pie.groupby(
            ['type'], as_index=False).aggregate(aggregation_functions)
        df_month_pie.reset_index(drop=True, inplace=True)

        values_pie = df_month_pie['power_kWh']
        pie_middletext = 'the Past 12 Months'

        # 3) For changing units of layout later on
        df3 = df_month
        df4 = df_month_pie

    elif 'line-chart' in changed_id:
        print("Hi")
        print(btn1, btn2, btn3, btn4)
        if btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
            print('Hour Pie chart')

            # Aggregate df_hour_bytype separating type of device
            df_hour_bytype = user1

            aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                     'year': 'first', 'power_kWh': 'sum', 'cost': 'sum',
                                     'dates_AMPM': 'first'}  # sum power when combining rows.
            df_hour_bytype = df_hour_bytype.groupby(['type', 'date', 'hours'], as_index=False).aggregate(
                aggregation_functions)
            df_hour_bytype.reset_index(drop=True, inplace=True)

            x_value = hoverData['points'][0]['x']
            xvalue_tohours = dt.datetime.strptime(
                x_value, '%I:%M%p').strftime('%H')

            # Get last 24 hours only

            print(x_value)
            print(xvalue_tohours)
            mask = (df_hour_bytype['hours'] == xvalue_tohours)

            # Delete these row indexes from dataFrame
            df_hour_bytype = df_hour_bytype.loc[mask]
            df_hour_bytype.reset_index(drop=True, inplace=True)
            df4 = df_hour_bytype
            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
            print('Month Pie chart')

            # Aggregate df_month_bytype separating type of device
            df_month_bytype = user1

            aggregation_functions = {'power': 'sum', 'time': 'first',
                                     'power_kWh': 'sum', 'cost': 'sum',
                                     'dates_AMPM': 'first'}  # sum power when combining rows.
            df_month_bytype = df_month_bytype.groupby(['type', 'month', 'year'], as_index=False).aggregate(
                aggregation_functions)
            df_month_bytype.reset_index(drop=True, inplace=True)

            x_value = hoverData['points'][0]['x']

            # Get last 24 hours only

            print(x_value)
            mask = (df_month_bytype['month'] == x_value)
            print(mask)
            # Delete these row indexes from dataFrame
            df_month_bytype = df_month_bytype.loc[mask]
            print(df_month_bytype)

            df_month_bytype.reset_index(drop=True, inplace=True)
            df4 = df_month_bytype

            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
            print('Week Pie chart')

            df_week_bytype = df_week

            # Aggregate df_week_bytype separating type of device

            aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                     'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'date': 'first'}  # sum power when combining rows.
            df_week_bytype = df_week_bytype.groupby(
                ['week', 'type'], as_index=False).aggregate(aggregation_functions)
            df_week_bytype.reset_index(drop=True, inplace=True)

            x_value = hoverData['points'][0]['x']
            print(hoverData)
            # Get last 24 hours only

            print(x_value)
            mask = (df_week_bytype['week'] == x_value)
            # Delete these row indexes from dataFrame
            df_week_bytype = df_week_bytype.loc[mask]

            df_week_bytype.reset_index(drop=True, inplace=True)
            df4 = df_week_bytype

            if x_value == 'Week 0':
                pie_middletext = "{} - {}".format(
                    start.strftime('%d %b'), end.strftime('%d %b'))

            elif x_value == 'Week -1':
                pie_middletext = "{} - {}".format((start - dt.timedelta(7)).strftime(
                    '%d %b'), (end - dt.timedelta(7)).strftime('%d %b'))

            elif x_value == 'Week -2':
                pie_middletext = "{} - {}".format((start - dt.timedelta(14)).strftime(
                    '%d %b'), (end - dt.timedelta(14)).strftime('%d %b'))

            elif x_value == 'Week -3':
                pie_middletext = "{} - {}".format((start - dt.timedelta(21)).strftime(
                    '%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
            print('Day Pie chart')

            # Aggregate df_day_bytype separating type of device
            df_day_bytype = user1

            aggregation_functions = {'power': 'sum', 'time': 'first',
                                     'power_kWh': 'sum', 'cost': 'sum',
                                     'dates_AMPM': 'first'}  # sum power when combining rows.
            df_day_bytype = df_day_bytype.groupby(
                ['type', 'date', 'hours'], as_index=False).aggregate(aggregation_functions)
            df_day_bytype.reset_index(drop=True, inplace=True)
            print(df_day_bytype)
            x_value = hoverData['points'][0]['x']

            # Get last 24 hours only
            print(x_value)
            x_value_withoutzero = dt.datetime.strptime(
                x_value, '%d/%m/%Y').strftime('%d/%#m/%Y')  # - doesnt work for windows.

            mask = (df_day_bytype['date'] == x_value_withoutzero)
            # Delete these row indexes from dataFrame
            df_day_bytype = df_day_bytype.loc[mask]
            df_day_bytype.reset_index(drop=True, inplace=True)
            df4 = df_day_bytype

            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        else:

            # Aggregate df_hour_bytype separating type of device
            df_hour_bytype = user1

            aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                     'year': 'first', 'power_kWh': 'sum', 'cost': 'sum',
                                     'dates_AMPM': 'first'}  # sum power when combining rows.
            df_hour_bytype = df_hour_bytype.groupby(['type', 'date', 'hours'], as_index=False).aggregate(
                aggregation_functions)
            df_hour_bytype.reset_index(drop=True, inplace=True)

            x_value = hoverData['points'][0]['x']
            xvalue_tohours = dt.datetime.strptime(
                x_value, '%I:%M%p').strftime('%H')

            print(x_value)
            print(xvalue_tohours)

            # Get last 24 hours only

            mask = (df_hour_bytype['hours'] == xvalue_tohours)

            # Delete these row indexes from dataFrame
            df_hour_bytype = df_hour_bytype.loc[mask]
            df_hour_bytype.reset_index(drop=True, inplace=True)
            df4 = df_hour_bytype
            pie_middletext = x_value

            print(df4)

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

    # G) This ELSE will run on First Load of Page

    else:
        if 'btntoggle_units.on' in changed_id:
            pass

        else:

            # Line Chart

            # Create new dataframe
            df_hour = user1

            # Aggregate data

            aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                     'year': 'first', 'power_kWh': 'sum', 'cost': 'sum',
                                     'dates_AMPM': 'first'}  # sum power when combining rows.
            df_hour = df_hour.groupby(
                ['date', 'hours'], as_index=False).aggregate(aggregation_functions)
            df_hour.reset_index(drop=True, inplace=True)

            # Get last 24 hours only

            df_hour['date'] = pd.to_datetime(df_hour['date'])
            end = end_date  # String of todays date
            end = dt.datetime.strptime(end, '%d/%m/%Y')
            mask = (df_hour['date'] == end)
            # Delete these row indexes from dataFrame
            df_hour = df_hour.loc[mask]
            df_hour.reset_index(drop=True, inplace=True)

            # Optional Convert to %d/%m/%Y
            df_hour['date'] = df_hour['date'].dt.strftime('%d/%m/%Y')

            # Pie Chart

            # Create new instance of df
            df_hour_pie = user1

            # Aggregate data

            aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                     'year': 'first', 'power_kWh': 'sum', 'cost': 'sum',
                                     'dates_AMPM': 'first'}  # sum power when combining rows.
            df_hour_pie = df_hour_pie.groupby(['date', 'hours', 'type'], as_index=False).aggregate(
                aggregation_functions)
            df_hour_pie.reset_index(drop=True, inplace=True)

            # Get last 24 hours only

            df_hour_pie['date'] = pd.to_datetime(df_hour_pie['date'])
            end = end_date  # String of todays date
            end = dt.datetime.strptime(end, '%d/%m/%Y')
            mask = (df_hour_pie['date'] == end)
            # Delete these row indexes from dataFrame
            df_hour_pie = df_hour_pie.loc[mask]
            df_hour_pie.reset_index(drop=True, inplace=True)

            # Optional Convert to %d/%m/%Y
            df_hour_pie['date'] = df_hour_pie['date'].dt.strftime('%d/%m/%Y')

            # Pie Chart
            values_pie = df_hour_pie['power_kWh']
            df4 = df_hour_pie
            pie_middletext = 'the Past 24 Hrs'

            # For changing units
            df3 = df_hour


# H) After global variables initialised, generate graphs
    # 1. Generate Graphs
    piechart = px.pie(
        data_frame=df4,
        names='type',
        hole=.3,
        values=values_pie,
    )

    piechart.update_layout(
        margin=dict(l=0, r=0, t=0, b=0, pad=0),
        uniformtext_minsize=12,
        uniformtext_mode='hide'

    )
    piechart.update_traces(textposition='inside')

# I) Once graphs generated, implement Unit Changes based on Toggle and Misc Layout+Design changes

    # 2. Toggle False = kWh, True = $

    if btnkwhdollars == False:

        hovertemplate = ('<b>%{text}</b><br>'+'%{y}<extra></extra>')
        units = 'Energy'

        fig2 = go.Figure()

        if btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
            x = df3['month']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
            x = df3['week']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

            fig2.update_xaxes(
                ticktext=["{} - {}".format(start.strftime('%d %b'), end.strftime('%d %b')),
                          "{} - {}".format((start - dt.timedelta(7)).strftime('%d %b'),
                                           (end - dt.timedelta(7)).strftime('%d %b')),
                          "{} - {}".format((start - dt.timedelta(14)).strftime(
                              '%d %b'), (end - dt.timedelta(14)).strftime('%d %b')),
                          "{} - {}".format((start - dt.timedelta(21)).strftime('%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))],
                tickvals=["Week 0", "Week -1", "Week -2", "Week -3"],
            )

        elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
            x = df3['date']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
            x = df3['dates_AMPM']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        else:
            x = df3['dates_AMPM']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        # Change to kWh for pie and line graph

        fig2.update_yaxes(ticksuffix=' kWh')

        piechart.update_traces(
            values=values_pie,
            labels=df4['type'],
            textinfo='label+percent',
            hovertemplate="%{label}<br>%{percent}<br>%{value} kWh"
        )
    else:
        hovertemplate = ('<b>%{text}</b><br>'+'%{y}<extra></extra>')

        units = 'Cost'
        fig2 = go.Figure()

        if btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
            x = df3['month']
            y = df3['cost']
            values_pie = df4['cost']

        elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
            x = df3['week']
            y = df3['cost']
            values_pie = df4['cost']

            fig2.update_xaxes(
                ticktext=["{} - {}".format(start.strftime('%d %b'), end.strftime('%d %b')),
                          "{} - {}".format((start - dt.timedelta(7)).strftime('%d %b'),
                                           (end - dt.timedelta(7)).strftime('%d %b')),
                          "{} - {}".format((start - dt.timedelta(14)).strftime(
                              '%d %b'), (end - dt.timedelta(14)).strftime('%d %b')),
                          "{} - {}".format((start - dt.timedelta(21)).strftime('%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))],
                tickvals=["Week 0", "Week -1", "Week -2", "Week -3"],
            )
        elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
            x = df3['date']
            y = df3['cost']
            values_pie = df4['cost']

        elif btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
            x = df3['dates_AMPM']
            y = df3['cost']
            values_pie = df4['cost']

        else:
            x = df3['dates_AMPM']
            y = df3['cost']
            values_pie = df4['cost']

        # Change to $ for pie and line graph

        fig2.update_yaxes(tickprefix='$ ')
        piechart.update_traces(
            values=values_pie,
            labels=df4['type'],
            textinfo='label+percent',
            hovertemplate="%{label}<br>%{percent}<br>$ %{value}"
        )

        # End of $

    # 3. Final Layout Changes
    fig2 = fig2.add_trace(go.Scattergl(x=x, y=y,
                                       hovertemplate='',

                                       line=dict(color='royalblue', width=4),

                                       ))

    fig2 = fig2.add_trace(go.Scattergl(mode='markers',
                                       x=x,
                                       y=y,
                                       hovertemplate='',

                                       marker=dict(
                                           size=12,
                                           line=dict(
                                               color='LightSkyBlue',
                                               width=2
                                           ),
                                       ),
                                       showlegend=False,

                                       ))

    fig2.update_layout(
        showlegend=False,
        legend=dict(
            x=0,
            y=1,
            traceorder="normal",
            font=dict(
                family="sans-serif",
                size=12,
                color="black"
            ),
            bgcolor="LightSteelBlue",
            bordercolor="Black",
            borderwidth=2
        )
    )

    fig2.update_layout(
        # title={
        #     'text': "Aggregated {}".format(units),
        #             'y': 0.9,
        #             'x': 0.5,
        #             'xanchor': 'center',
        #             'yanchor': 'top',},
        xaxis_title="",
        yaxis_title="",
        yaxis=dict(showgrid=True, zeroline=False),
        hoverlabel=dict(
            bgcolor="white",)

    )

    colors = ['primary', 'success', 'danger', 'warning', 'info', '#6610f2']
    piechart.update_traces(
        sort=False,
        marker=dict(colors=colors)

    )

    piechart.update_layout(
        # title_text="{} Breakdown for {}".format(units, pie_middletext),
        # title={
        #     'x': 0.5,
        #     'xanchor': 'center'},
        margin={'t': 30},
        showlegend=False,
        hoverlabel=dict(
            bgcolor="white",
        ),
        # Add annotations in the center of the donut pies.
        # annotations=[dict(text=pie_middletext, x=0.5, y=0.5,
        #                   font_size=20, showarrow=False)]
    )

    fig2.add_trace(go.Scatter(x=x, y=y,
                              hovertemplate=hovertemplate,
                              text=['Click Me to see the Plug Load breakdown!'.format(
                                  i + 1) for i in range(len(x))],

                              fill='tozeroy',
                              mode='lines',
                              line=dict(width=0,
                                        color='rgb(127, 166, 238)'),
                              ))

    # 4. Return all graphs
    return fig2, piechart, "Aggregated {}".format(units), "{} Breakdown for {}".format(units, pie_middletext)
















































































































# import dash
# import string
# import plotly.io as pio
# import pandas as pd
# import plotly.graph_objects as go
# import dash_core_components as dcc
# import dash_html_components as html
# # import dash.dependencies as dd
# import dash_bootstrap_components as dbc
# import plotly.express as px
# import datetime as dt
# import dateutil.relativedelta
# import dash_daq as daq
# from django_plotly_dash import DjangoDash
#
# pio.templates.default = "simple_white"
#
# # A) Function to create new essential columns
# def initialise_variables():
#     # Initialise some variables
#     global user1
#     global singapore_tariff_rate
#     singapore_tariff_rate = 0.201
#
#
#     # Manipulate Data
#
#     user1 = pd.read_csv('.\\plug_mate_app\\dash_apps\\finished_apps\\user1_alldevices.csv')
#     hours = []
#     months= []
#     years= []
#     dates_AMPM = []
#
#     for unix_time in user1['unix_time']:
#         month = dt.datetime.utcfromtimestamp(unix_time).strftime('%B')
#         year = dt.datetime.utcfromtimestamp(unix_time).strftime('%Y')
#         date_AMPM = dt.datetime.utcfromtimestamp(unix_time).strftime('%I:%M%p')
#         hour = dt.datetime.utcfromtimestamp(unix_time).strftime('%H')
#
#         hours.append(hour)
#         months.append(month)
#         years.append(year)
#         dates_AMPM.append(date_AMPM)
#
#     user1['month'] = months
#     user1['year'] = years
#     user1['dates_AMPM'] = dates_AMPM
#     user1['hours'] = hours
#
#     user1.loc[user1.index.dropna()]
#
#     # Start to add kWh, Costs and Device Type Caps
#
#     # Add kWh
#     kWhList = []
#     for val in user1['power']:
#         kWhList.append(round(val/1000,3))
#
#     user1['power_kWh'] = kWhList
#
#
#     # Add costs
#     cost = []
#     for kwh in user1['power_kWh']:
#         cost.append(round(kwh*singapore_tariff_rate,3))
#
#     user1['cost'] = cost
#
#
#
#     # Add device type with Caps
#     typecapped = []
#     for type in user1['type']:
#         typecapped.append(string.capwords(type))
#     user1['type'] = typecapped
# # Manipulate and Initialise variables for later
# initialise_variables()
#
#
# # B) Dash App initialisation
# app = DjangoDash('historical_consumption', external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"], add_bootstrap_links=True)
#
#
# # C) App Layout
# app.layout = \
#     html.Div([
#         dbc.Row([
#             html.Div([
#                 dbc.Button('Hour', id='hour', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
#                            color="primary", className="mr-1"),
#                 dbc.Button('Day', id='day', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
#                            color="primary",
#                            className="mr-1"),
#                 dbc.Button('Week', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
#                            color="primary", className="mr-1"),
#                 dbc.Button('Month', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
#                            color="primary", className="mr-1"),
#             ])
#         ], style={'margin': 'auto', 'justify-content': 'center'}),
#
#         dbc.Row([
#             html.Div([
#                 daq.BooleanSwitch(id='btntoggle_units', on=False, color='#e6e6e6'),
#             ])], style={'margin-top':'3%', 'justify-content': 'center'}),
#
#         dbc.Row([
#             dbc.Col([html.H4(children='Aggregated Consumption')], width=8),
#             dbc.Col([html.H4(children='Energy Breakdown by Plug Load Type')], width=4),
#
#         ], style={'text-align': 'center'}),
#
#         dbc.Row([
#             dbc.Col([dcc.Graph(id='line-chart')], width=8),
#             dbc.Col([dcc.Graph(id='pie-chart-2')], width=4),
#         ], style={'margin': 'auto', 'columnCount': 2})], style={'height': '36rem', 'padding-bottom': '10%'})
#
# # D) This callback activates upon HOUR DAY WEEK MONTH click
# @app.callback([dash.dependencies.Output('line-chart','figure'),
#                dash.dependencies.Output('pie-chart-2','figure'),
#                ],
#               [dash.dependencies.Input('hour', 'n_clicks'),
#                dash.dependencies.Input('day', 'n_clicks'),
#                dash.dependencies.Input('week','n_clicks'),
#                dash.dependencies.Input('month', 'n_clicks'),
#                dash.dependencies.Input('btntoggle_units', 'on')],
#               [dash.dependencies.State('hour', 'n_clicks_timestamp'),
#                dash.dependencies.State('day', 'n_clicks_timestamp'),
#                dash.dependencies.State('week','n_clicks_timestamp'),
#                dash.dependencies.State('month', 'n_clicks_timestamp'),]
#               )
# # E) Callback Function when Day Hour Month or Week clicked
# def update_graph_DayMonthYear(btn1_click,btn2_click,btn3_click,btn4_click,
#                               btnkwhdollars,btn1,btn2,btn3,btn4):
#     global user1
#     global df3
#     global df4
#     global piechart
#     global start
#     global end
#     global values_pie
#
#     end_date = '19/3/2020'
#
#     # F) Search for the most recent changed ID to know if hour day week or Month
#     changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0] #checks the list of id that recently triggered a callback in dash.callback_context.triggered list
#
#     if 'hour' in changed_id:
#
#         # Line Chart
#
#         # Create new dataframe
#         df_hour = user1
#
#         # Aggregate data
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first','power_kWh':'sum','cost':'sum','dates_AMPM':'first'}  # sum power when combining rows.
#         df_hour = df_hour.groupby(['date','hours'], as_index=False).aggregate(aggregation_functions)
#         df_hour.reset_index(drop=True, inplace=True)
#
#
#         # Get last 24 hours only
#
#         df_hour['date'] = pd.to_datetime(df_hour['date'])
#         end = end_date #String of todays date
#         end = dt.datetime.strptime(end, '%d/%m/%Y')
#         mask = (df_hour['date'] == end)
#         # Delete these row indexes from dataFrame
#         df_hour = df_hour.loc[mask]
#         df_hour.reset_index(drop=True, inplace=True)
#
#
#         # Optional Convert to %d/%m/%Y
#         df_hour['date'] = df_hour['date'].dt.strftime('%d/%m/%Y')
#
#         # Pie Chart
#
#         # Create new instance of df
#         df_hour_pie = user1
#
#         # Aggregate data
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first','power_kWh':'sum','cost':'sum','dates_AMPM':'first'}  # sum power when combining rows.
#         df_hour_pie = df_hour_pie.groupby(['date','hours','type'], as_index=False).aggregate(aggregation_functions)
#         df_hour_pie.reset_index(drop=True, inplace=True)
#
#
#         # Get last 24 hours only
#
#         df_hour_pie['date'] = pd.to_datetime(df_hour_pie['date'])
#         end = end_date #String of todays date
#         end = dt.datetime.strptime(end, '%d/%m/%Y')
#         mask = (df_hour_pie['date'] == end)
#         # Delete these row indexes from dataFrame
#         df_hour_pie = df_hour_pie.loc[mask]
#         df_hour_pie.reset_index(drop=True, inplace=True)
#
#
#         # Optional Convert to %d/%m/%Y
#         df_hour_pie['date'] = df_hour_pie['date'].dt.strftime('%d/%m/%Y')
#
#
#         # Pie Chart values
#         values_pie = df_hour_pie['power_kWh']
#
#         # For changing units
#         df3 = df_hour
#         df4 = df_hour_pie
#
#     elif 'day' in changed_id:
#
#         # Line Chart
#
#         # Create new dataframe
#         df_day = user1
#
#         # Aggregate data
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first','power_kWh':'sum','cost':'sum'}  # sum power when combining rows.
#         df_day = df_day.groupby(['date'], as_index=False).aggregate(aggregation_functions)
#         df_day.reset_index(drop=True, inplace=True)
#
#         # Get last 7 days
#         # Get names of indexes for which column Date only has values 7 days before 29/2/2020
#         df_day['date'] = pd.to_datetime(df_day['date'])
#         end = end_date
#         end = dt.datetime.strptime(end, '%d/%m/%Y')
#         start = end - dt.timedelta(7)
#         mask = (df_day['date'] > start) & (df_day['date'] <= end)
#         # Delete these row indexes from dataFrame
#         df_day = df_day.loc[mask]
#         df_day.reset_index(drop=True, inplace=True)
#
#         # Optional Convert to %d/%m/%Y
#         df_day['date'] = df_day['date'].dt.strftime('%d/%m/%Y')
#
#
#
#         # Pie Chart
#
#         # Create new instance of df
#         df_day_pie = user1
#
#         # Aggregate data
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_day_pie = df_day_pie.groupby(['date','type'], as_index=False).aggregate(aggregation_functions)
#         df_day_pie.reset_index(drop=True, inplace=True)
#
#         # Get names of indexes for which column Date only has values 7 days before 29/2/2020
#         df_day_pie['date'] = pd.to_datetime(df_day_pie['date'])
#         end = end_date
#         end = dt.datetime.strptime(end, '%d/%m/%Y')
#         start = end - dt.timedelta(7)
#         mask = (df_day_pie['date'] > start) & (df_day_pie['date'] <= end)
#         # Delete these row indexes from dataFrame
#         df_day_pie = df_day_pie.loc[mask]
#         df_day_pie.reset_index(drop=True, inplace=True)
#
#
#
#         # Aggregate data based on type for past 7 days
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_day_pie = df_day_pie.groupby(['type'], as_index=False).aggregate(aggregation_functions)
#         df_day_pie.reset_index(drop=True, inplace=True)
#
#         # Pie Chart
#         values_pie = df_day_pie['power_kWh']
#
#         # For changing units
#         df3 = df_day
#         df4 = df_day_pie
#
#     elif 'week' in changed_id:
#
#
#         # 1. Filter past 4 weeks using timedelta 28 days
#         # For Line Chart
#
#         # Create new dataframe
#         df_week = user1
#
#         # Get names of indexes for which column Date only has values 4 weeks before 29/2/2020
#         df_week['date'] = pd.to_datetime(df_week['date'])
#         end = end_date
#         end = dt.datetime.strptime(end, '%d/%m/%Y')
#         start = end - dt.timedelta(28)
#         mask = (df_week['date'] > start) & (df_week['date'] <= end)
#
#         # Delete these row indexes from dataFrame
#         df_week = df_week.loc[mask]
#         df_week.reset_index(drop=True, inplace=True)
#
#
#
#         # 2. Append new column called Week
#
#
#         df_week['week'] = ''
#
#
#         # 3. Label weeks 1, 2, 3, 4 based on start date
#
#         start = end - dt.timedelta(7)
#         # If datetime > start & datetime <= end ==> Week 1
#         # idx = df.index[df['BoolCol']] # Search for indexes of value in column
#         # df.loc[idx] # Get rows with all the columns
#         df_week.loc[(df_week['date'] > start) & (df_week['date'] <= end), ['week']] = 'Week 0'
#         df_week.loc[(df_week['date'] > (start-dt.timedelta(7))) & (df_week['date'] <= (end-dt.timedelta(7))), ['week']] = 'Week -1'
#         df_week.loc[(df_week['date'] > (start-dt.timedelta(14))) & (df_week['date'] <= (end-dt.timedelta(14))), ['week']] = 'Week -2'
#         df_week.loc[(df_week['date'] > (start-dt.timedelta(21))) & (df_week['date'] <= (end-dt.timedelta(21))), ['week']] = 'Week -3'
#
#         df_week.reset_index(drop=True, inplace=True)
#
#         df_week_line = df_week
#
#         # 4. Aggregate by Week
#
#         # Aggregate data
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first','power_kWh':'sum','cost':'sum','date':'first'}  # sum power when combining rows.
#         df_week_line = df_week_line.groupby(['week'], as_index=False).aggregate(aggregation_functions)
#         df_week_line.reset_index(drop=True, inplace=True)
#
#
#         # 5. Generate Graphs
#
#         # Create new variable
#
#         # For Pie Chart
#         df_week_pie = df_week #already filtered past 4 weeks
#
#         # Aggregate data
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_week_pie = df_week_pie.groupby(['type'], as_index=False).aggregate(aggregation_functions)
#         df_week_pie.reset_index(drop=True, inplace=True)
#
#         values_pie = df_week_pie['power_kWh']
#
#         # For changing units
#         df3 = df_week_line
#         df4 = df_week_pie
#
#     elif 'month' in changed_id:
#
#         # 1) For Line Chart
#         # Create new dataframe
#         df_month = user1
#
#         # Aggregate data by date first before filtering months
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_month = df_month.groupby(['date'], as_index=False).aggregate(aggregation_functions)
#         df_month.reset_index(drop=True, inplace=True)
#
#         # Filter data for Last 12 months
#         # Get names of indexes for which column Date only has values 12 months before 1/2/2020
#         df_month['date'] = pd.to_datetime(df_month['date'])
#         end = end_date
#         end_first_day_date = dt.datetime.strptime(end, '%d/%m/%Y').replace(day=1)
#
#
#         start = end_first_day_date - dateutil.relativedelta.relativedelta(months=12)
#         mask = (df_month['date'] > start) & (df_month['date'] <= end)
#         # Delete these row indexes from dataFrame
#         df_month = df_month.loc[mask]
#         df_month.reset_index(drop=True, inplace=True)
#
#
#         # Aggregate Data into Months based on last 12 months
#
#         aggregation_functions = {'power': 'sum', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_month = df_month.groupby(['month'], as_index=False).aggregate(aggregation_functions)
#         df_month.reset_index(drop=True, inplace=True)
#
#         # 2) For Pie Chart
#
#         df_month_pie = user1
#
#         # Aggregate data by date first before filtering months
#
#         aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_month_pie = df_month_pie.groupby(['date','type'], as_index=False).aggregate(aggregation_functions)
#         df_month_pie.reset_index(drop=True, inplace=True)
#
#         # Filter data for Last 12 months
#         # Get names of indexes for which column Date only has values 12 months before 1/2/2020
#         df_month_pie['date'] = pd.to_datetime(df_month_pie['date'])
#         end = end_date
#         end_first_day_date = dt.datetime.strptime(end, '%d/%m/%Y').replace(day=1)
#
#
#         start = end_first_day_date - dateutil.relativedelta.relativedelta(months=12)
#         mask = (df_month_pie['date'] > start) & (df_month_pie['date'] <= end)
#         # Delete these row indexes from dataFrame
#         df_month_pie = df_month_pie.loc[mask]
#         df_month_pie.reset_index(drop=True, inplace=True)
#
#
#         # Aggregate Data into Months based on last 12 months
#
#         aggregation_functions = {'power': 'sum', 'time': 'first',
#                                  'year': 'first', 'power_kWh': 'sum',
#                                  'cost': 'sum'}  # sum power when combining rows.
#         df_month_pie = df_month_pie.groupby(['type'], as_index=False).aggregate(aggregation_functions)
#         df_month_pie.reset_index(drop=True, inplace=True)
#
#         values_pie = df_month_pie['power_kWh']
#
#         # 3) For changing units of layout later on
#         df3 = df_month
#         df4 = df_month_pie
#
#     # G) This ELSE will run on First Load of Page
#
#     else:
#         if 'btntoggle_units.on' in changed_id:
#             pass
#
#         else:
#
#             # Line Chart
#
#             # Create new dataframe
#             df_hour = user1
#
#             # Aggregate data
#
#             aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                      'year': 'first', 'power_kWh': 'sum', 'cost': 'sum',
#                                      'dates_AMPM': 'first'}  # sum power when combining rows.
#             df_hour = df_hour.groupby(['date', 'hours'], as_index=False).aggregate(aggregation_functions)
#             df_hour.reset_index(drop=True, inplace=True)
#
#
#             # Get last 24 hours only
#
#             df_hour['date'] = pd.to_datetime(df_hour['date'])
#             end = end_date  # String of todays date
#             end = dt.datetime.strptime(end, '%d/%m/%Y')
#             mask = (df_hour['date'] == end)
#             # Delete these row indexes from dataFrame
#             df_hour = df_hour.loc[mask]
#             df_hour.reset_index(drop=True, inplace=True)
#
#
#             # Optional Convert to %d/%m/%Y
#             df_hour['date'] = df_hour['date'].dt.strftime('%d/%m/%Y')
#
#
#
#             # Pie Chart
#
#             # Create new instance of df
#             df_hour_pie = user1
#
#             # Aggregate data
#
#             aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
#                                      'year': 'first', 'power_kWh': 'sum', 'cost': 'sum',
#                                      'dates_AMPM': 'first'}  # sum power when combining rows.
#             df_hour_pie = df_hour_pie.groupby(['date', 'hours', 'type'], as_index=False).aggregate(
#                 aggregation_functions)
#             df_hour_pie.reset_index(drop=True, inplace=True)
#
#
#             # Get last 24 hours only
#
#             df_hour_pie['date'] = pd.to_datetime(df_hour_pie['date'])
#             end = end_date  # String of todays date
#             end = dt.datetime.strptime(end, '%d/%m/%Y')
#             mask = (df_hour_pie['date'] == end)
#             # Delete these row indexes from dataFrame
#             df_hour_pie = df_hour_pie.loc[mask]
#             df_hour_pie.reset_index(drop=True, inplace=True)
#
#
#             # Optional Convert to %d/%m/%Y
#             df_hour_pie['date'] = df_hour_pie['date'].dt.strftime('%d/%m/%Y')
#
#
#             # Pie Chart
#             values_pie = df_hour_pie['power_kWh']
#             df4 = df_hour_pie
#
#
#             # For changing units
#             df3 = df_hour
#
#
#     # H) After global variables initialised, generate graphs
#     # 1. Generate Graphs
#     piechart = px.pie(
#         data_frame=df4,
#         names='type',
#         hole=.3,
#         values=values_pie,
#         # color_discrete_sequence=px.colors.sequential.Viridis
#     )
#
#     piechart.update_layout(
#         margin=dict(l=0, r=0, t=0, b=0, pad=0),
#
#     )
#     piechart.update_traces(textposition='inside')
#     piechart.update_layout(uniformtext_minsize=12,
#                            uniformtext_mode='hide')
#
#     # I) Once graphs generated, implement Unit Changes based on Toggle and Misc Layout+Design changes
#
#     # 2. Toggle False = kWh, True = $
#
#     if btnkwhdollars == False:
#
#         hovertemplate = '%{y} <extra></extra>'
#         units = 'Energy'
#
#         fig2 = go.Figure()
#
#         if btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
#             x = df3['month']
#             y = df3['power_kWh']
#             values_pie = df4['power_kWh']
#
#
#         elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
#             x = df3['week']
#             y = df3['power_kWh']
#             values_pie = df4['power_kWh']
#
#             fig2.update_xaxes(
#                 ticktext=["{} - {}".format(start.strftime('%d %b'), end.strftime('%d %b')),
#                           "{} - {}".format((start - dt.timedelta(7)).strftime('%d %b'), (end - dt.timedelta(7)).strftime('%d %b')),
#                           "{} - {}".format((start - dt.timedelta(14)).strftime('%d %b'), (end - dt.timedelta(14)).strftime('%d %b')),
#                           "{} - {}".format((start - dt.timedelta(21)).strftime('%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))],
#                 tickvals=["Week 0", "Week -1", "Week -2", "Week -3"],
#             )
#
#         elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
#             x = df3['date']
#             y = df3['power_kWh']
#             values_pie = df4['power_kWh']
#
#
#         elif btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
#             x = df3['dates_AMPM']
#             y = df3['power_kWh']
#             values_pie = df4['power_kWh']
#
#
#         else:
#             x = df3['dates_AMPM']
#             y = df3['power_kWh']
#             values_pie = df4['power_kWh']
#
#
#         # Change to kWh for pie and line graph
#
#         fig2.update_yaxes(ticksuffix=' kWh')
#
#         piechart.update_traces(
#             values = values_pie,
#             labels=df4['type'],
#             textinfo='label+percent',
#             hovertemplate="%{label}<br>%{percent}<br>%{value} kWh"
#         )
#     else:
#         hovertemplate = '%{y}<extra></extra>'
#
#         units = 'Cost'
#         fig2 = go.Figure()
#
#         if btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
#             x = df3['month']
#             y = df3['cost']
#             values_pie = df4['cost']
#
#         elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
#             x = df3['week']
#             y = df3['cost']
#             values_pie = df4['cost']
#
#             fig2.update_xaxes(
#                 ticktext=["{} - {}".format(start.strftime('%d %b'), end.strftime('%d %b')),
#                           "{} - {}".format((start - dt.timedelta(7)).strftime('%d %b'), (end - dt.timedelta(7)).strftime('%d %b')),
#                           "{} - {}".format((start - dt.timedelta(14)).strftime('%d %b'), (end - dt.timedelta(14)).strftime('%d %b')),
#                           "{} - {}".format((start - dt.timedelta(21)).strftime('%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))],
#                 tickvals=["Week 0", "Week -1", "Week -2", "Week -3"],
#             )
#         elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
#             x = df3['date']
#             y = df3['cost']
#             values_pie = df4['cost']
#
#
#         elif btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
#             x = df3['dates_AMPM']
#             y = df3['cost']
#             values_pie = df4['cost']
#
#         else:
#             x = df3['dates_AMPM']
#             y = df3['cost']
#             values_pie = df4['cost']
#
#
#         # Change to $ for pie and line graph
#
#         fig2.update_yaxes(tickprefix='$ ')
#         piechart.update_traces(
#             values = values_pie,
#             labels=df4['type'],
#             textinfo='label+percent',
#             hovertemplate="%{label}<br>%{percent}<br>$ %{value}"
#         )
#
#         # End of $
#
#
#     # 3. Final Layout Changes
#     fig2 = fig2.add_trace(go.Scattergl(x=x, y=y,
#                                        hovertemplate='',
#
#                                        line=dict(color='royalblue', width=4),
#
#                                        ))
#
#     fig2 = fig2.add_trace(go.Scattergl(mode='markers',
#                                        x=x,
#                                        y=y,
#                                        hovertemplate='',
#
#                                        marker=dict(
#                                            # color='#ffc107',
#                                            # size=np.where((df1['power'] >= 50), df1['power']/2, 0),
#
#                                            # size=df1['power']/2,
#                                            line=dict(
#                                                color='LightSkyBlue',
#                                                width=2
#                                            ),
#                                        ),
#                                        showlegend=False,
#
#                                        ))
#
#     fig2.update_layout(
#         showlegend=False,
#         legend=dict(
#             x=0,
#             y=1,
#             traceorder="normal",
#             font=dict(
#                 family="sans-serif",
#                 size=12,
#                 color="black"
#             ),
#             bgcolor="LightSteelBlue",
#             bordercolor="Black",
#             borderwidth=2
#         )
#     )
#
#     fig2.update_layout(
#         # title = {
#         #     'text': "Aggregated {}".format(units),
#         #     'y': 0.9,
#         #     'x': 0.5,
#         #     'xanchor': 'center',
#         #     'yanchor': 'top'},
#         xaxis_title = "",
#         yaxis_title = "Aggregated {}".format(units),
#         yaxis=dict(showgrid=True, zeroline=False),
#         hoverlabel=dict(
#             bgcolor="white",)
#
#     )
#
#     piechart.update_layout(
#         # title_text="{} Breakdown by Plug Load Type".format(units),
#         # title={
#         #     'x': 0.5,
#         #     'xanchor': 'center'},
#         margin={'t': 30},
#         showlegend=False,
#         hoverlabel=dict(
#             bgcolor="white",
#         ),
#     )
#
#
#     fig2.add_trace(go.Scatter(x=x, y=y,
#                               hovertemplate=hovertemplate,
#                               fill='tozeroy',
#                               mode='lines',
#                               line=dict(width=0,
#                                         color='rgb(127, 166, 238)'),
#                               ))
#
#     # 4. Return all graphs
#     return fig2, piechart
#
#
# # if __name__ == '__main__':
# #     app.run_server(debug=True)