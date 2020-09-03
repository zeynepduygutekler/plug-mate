import dash
import string
import plotly.io as pio
import pandas as pd
import plotly.graph_objects as go
import dash_core_components as dcc
import dash_html_components as html
import dash.dependencies as dd
import dash_bootstrap_components as dbc
from django_plotly_dash import DjangoDash
import plotly.express as px
import datetime as dt
import dateutil.relativedelta
import dash_daq as daq
from django.db import connection
from memory_profiler import profile
from glob import glob
import os
import numpy as np
import copy


pio.templates.default = "simple_white"
# path = "C:\\Users\\zaidy\\Documents\\GitHub\\zeynepduygutekler\\plug-mate\\plug_mate_app\\dash_apps\\finished_apps"
# path = 'plug_mate_app/dash_apps/finished_apps'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def dayClickDataPiechart(df_day_bytype):
    # Aggregate df_day_bytype separating type of device
    # '''Insert SQL Code'''
    # df_day_bytype = pd.read_csv(os.path.join(
    #     '', 'plug_mate_app/dash_apps/finished_apps/df_day_pie.csv'))  # df_day_pie
    # '''End of SQL Code'''

    # Optional Convert to %d/%m/%Y
    df_day_bytype['date'] = pd.to_datetime(df_day_bytype['date'])
    df_day_bytype['date_withoutYear'] = df_day_bytype['date'].dt.strftime(
        '%d/%m')
    return df_day_bytype


# B) Dash App initialisation
app = DjangoDash('historical_consumption_manager',
                 external_stylesheets=[
                     "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"],
                 add_bootstrap_links=True)

# C) App Layout
app.layout = \
    html.Div([
        html.Link(
            rel='stylesheet',
            href='/static/assets/custom_style.css'
        ),
        html.Div([
            dbc.Col([
                    dbc.Row([
                        dbc.Button('Days', id='day', n_clicks=0, n_clicks_timestamp=0,
                                   color="primary",
                                   className="mr-1"),
                        dbc.Button('Weeks', id='week', n_clicks=0, n_clicks_timestamp=0,
                                   color="primary", className="mr-1", active=True),
                        dbc.Button('Months', id='month', n_clicks=0, n_clicks_timestamp=0,
                                   color="primary", className="mr-1"),
                        dbc.Button('Year', id='year', n_clicks=0,
                                   n_clicks_timestamp=0, color="primary", className="mr-1"),

                        html.Div([
                            daq.BooleanSwitch(id='btntoggle_units', on=False, color='#e6e6e6')],
                            style={'width': 'fit-content'}
                        ),
                    ], style={'justify-content': 'center'}),

                    dbc.Row([
                        dbc.Col([
                            html.H6("Aggregated Energy", id='lineTitle',
                                    style={'margin-left': '5%'}),
                            html.Div(dbc.Spinner(color="primary", id="loadingLine",
                                                 children=[
                                                     dcc.Graph(id='line-chart', config={'displayModeBar': False}, clear_on_unhover=True, style={'width': '100vh', 'height': '70vh'})],
                                                 spinner_style={"width": "3rem", "height": "3rem"}))

                        ], style={'text-align': 'center', 'padding': '0'}, width=7),
                        dbc.Col([
                            html.H6("Energy Breakdown Today", id='pieTitle', style={
                                    'color': '#5a5c69!important'}),
                            html.Div(
                                dbc.Spinner(color="primary", id="loadingPie",
                                            children=[
                                                dcc.Graph(id='pie-chart-2', config={'displayModeBar': False}, style={'width': '100%', 'height': '65vh'})],
                                            spinner_style={"width": "3rem", "height": "3rem"})),

                        ], width=5, style={'text-align': 'center'}),
                    ], style={'justify-content': 'left', 'padding-top': '1%',  'margin-left': '0px'}),
                    ], style={'justify-content': 'center', 'padding': '0'}),

        ], style={'width': '97%'}),
        dcc.Interval(
            id='interval-component',
            interval=800,  # in milliseconds
            max_intervals=2
        )
    ], style={'height': '100%'})

# D) This callback activates upon HOUR DAY WEEK MONTH click


@ app.expanded_callback(
    [dd.Output('line-chart', 'figure'),
     dd.Output('pie-chart-2', 'figure'),
     dd.Output('lineTitle', 'children'),
     dd.Output('pieTitle', 'children'),
     dd.Output('day', 'active'),
     dd.Output('week', 'active'),
     dd.Output('month', 'active'),
     dd.Output('year', 'active')],
    [dd.Input('year', 'n_clicks'),
     dd.Input('day', 'n_clicks'),
     dd.Input('week', 'n_clicks'),
     dd.Input('month', 'n_clicks'),
     dd.Input('btntoggle_units', 'on'),
     dd.Input('line-chart', 'clickData'),
     dd.Input('interval-component', 'n_intervals')],
    [dd.State('line-chart', 'hoverData'),
     dd.State('year', 'n_clicks_timestamp'),
     dd.State('day', 'n_clicks_timestamp'),
     dd.State('week', 'n_clicks_timestamp'),
     dd.State('month', 'n_clicks_timestamp')])
# E) Callback Function when Day Hour Month or Week clicked
# @profile
def update_graph_DayMonthYear(btn1_click, btn2_click, btn3_click, btn4_click, btnkwhdollars,
                              clickData, interval,
                              hoverData, yearbtn, daybtn, weekbtn, monthbtn, **kwargs):
    global df_hour, df_hour_pie, df_week_line, df_week_pie
    global df3, df4, piechart
    global fig2
    global values_pie, pie_middletext
    global dayActive, weekActive, monthActive, yearActive
    global df_hour_bytype, df_month_bytype, df_day_bytype, df_week_bytype
    global path
    global average_cost
    global average_kWh

    # F) Search for the most recent changed ID to know if hour day week or Month
    # checks the list of id that recently triggered a callback in dash.callback_context.triggered list
    try:
        changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]
    except:
        changed_id = 'week'

    # Get user id
    # user_id = kwargs['user'].id
    user_id = 1

    # Import Average Values
    average_df = pd.read_csv(
        ("{}/finished_apps/manager_csv/AverageDailyWeeklyMonthlyYearly.csv").format(BASE_DIR))

    # print(average_df)
    if 'year' in changed_id:

        df_year = pd.read_csv(
            ("{}/finished_apps/manager_csv/manager_df_year.csv").format(BASE_DIR))
        df_year_pie = pd.read_csv(
            ("{}/finished_apps/manager_csv/manager_df_year_pie.csv").format(BASE_DIR))

        # Pie Chart values
        values_pie = df_year_pie['power_kWh']
        pie_middletext = 'Last 4 Years'

        # For changing units
        df3 = copy.deepcopy(df_year)

        df4 = copy.deepcopy(df_year_pie)
        dayActive = False
        weekActive = False
        monthActive = False
        yearActive = True

        average_kWh = average_df.loc[(
            average_df['type'] == 'yearly')]['avg_energy']
        average_cost = average_df.loc[(
            average_df['type'] == 'yearly')]['avg_cost']

        average_kWh = average_kWh.reset_index(drop=True)
        average_cost = average_cost.reset_index(drop=True)

    elif 'day' in changed_id:

        # df_day
        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         "SELECT * FROM historical_days_line WHERE user_id=%s", [user_id])
        #     results = cursor.fetchall()
        # df_day = pd.DataFrame(results, columns=['user_id', 'date', 'power', 'month', 'time',
        #                                         'year', 'power_kWh', 'cost', 'date_withoutYear'])
        # df_day.drop(columns=['user_id'], inplace=True)

        # Aggregate data
        df_day = pd.read_csv(
            ("{}/finished_apps/manager_csv/manager_7m_daily.csv").format(BASE_DIR))

        # sum power when combining rows.
        df_day = df_day.tail(7)

        aggregation_functions = {'power_kWh': 'sum',
                                 'cost': 'sum', 'date_withoutYear': 'first'}
        df_day = df_day.groupby(
            ['date'], as_index=False).aggregate(aggregation_functions)
        df_day["date"] = pd.to_datetime(df_day["date"])

        df_day.reset_index(drop=True, inplace=True)

        # df_day_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_days_pie WHERE user_id=%s", [user_id])
            results = cursor.fetchall()
        df_day_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'date', 'power', 'month',
                                                    'time', 'year', 'power_kWh', 'cost'])
        df_day_pie.drop(columns=['user_id'], inplace=True)

        # Pie Chart
        values_pie = df_day_pie['power_kWh']
        pie_middletext = 'last 7 Days'

        # For changing units

        df3 = df_day
        df4 = df_day_pie
        dayActive = True
        weekActive = False
        monthActive = False
        yearActive = False
        average_kWh = average_df.loc[(
            average_df['type'] == 'daily')]['avg_energy']
        average_cost = average_df.loc[(
            average_df['type'] == 'daily')]['avg_cost']

        average_kWh = average_kWh.reset_index(drop=True)
        average_cost = average_cost.reset_index(drop=True)

    elif 'week' in changed_id:
        # df_week_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [user_id])
            results = cursor.fetchall()
        df_week_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'week', 'power',
                                                     'month', 'time', 'year', 'power_kWh', 'cost'])
        df_week_pie.drop(columns=['user_id'], inplace=True)

        # df_week_bytype
        df_week_bytype = copy.deepcopy(df_week_pie)

        # df_week_line
        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         "SELECT * FROM historical_weeks_line WHERE user_id=%s", [user_id])
        #     results = cursor.fetchall()
        # df_week_line = pd.DataFrame(results, columns=['user_id', 'week', 'power', 'month',
        #                                               'time', 'year', 'power_kWh', 'cost', 'date'])
        # df_week_line.drop(columns=['user_id'], inplace=True)
        df_week_line = pd.read_csv(
            ("{}/finished_apps/manager_csv/manager_7m_weekly.csv").format(BASE_DIR))

        # sum power when combining rows.
        df_week_line = df_week_line.tail(4)

        aggregation_functions = {'power_kWh': 'sum',
                                 'cost': 'sum'}
        df_week_line = df_week_line.groupby(
            ['date'], as_index=False).aggregate(aggregation_functions)
        df_week_line.reset_index(drop=True, inplace=True)

        df_to_sort = df_week_line
        df_to_sort['date'] = pd.to_datetime(df_to_sort.date)
        df_to_sort = df_to_sort.sort_values(by='date')
        df_to_sort = df_to_sort.reset_index(drop=True)
        values_pie = df_week_pie['power_kWh']
        pie_middletext = 'Last 4 weeks'
        # For changing units
        df3 = df_to_sort
        df4 = df_week_pie

        dayActive = False
        weekActive = True
        monthActive = False
        yearActive = False
        average_kWh = average_df.loc[(
            average_df['type'] == 'weekly')]['avg_energy']
        average_cost = average_df.loc[(
            average_df['type'] == 'weekly')]['avg_cost']

        average_kWh = average_kWh.reset_index(drop=True)
        average_cost = average_cost.reset_index(drop=True)
    elif 'month' in changed_id:

        # df_month
        # with connection.cursor() as cursor:
        #     cursor.execute(
        #         "SELECT * FROM historical_months_line WHERE user_id=%s", [user_id])
        #     results = cursor.fetchall()
        # df_month = pd.DataFrame(results, columns=['user_id', 'month', 'year', 'power', 'time',
        #                                           'power_kWh', 'unix_time', 'cost'])
        # df_month.drop(columns=['user_id'], inplace=True)
        df_month = pd.read_csv(
            ("{}/finished_apps/manager_csv/manager_1y_monthly.csv").format(BASE_DIR))

        # sum power when combining rows.
        df_month = df_month.tail(6)

        aggregation_functions = {'power_kWh': 'sum', 'date': 'first',
                                 'cost': 'sum'}
        df_month = df_month.groupby(
            ['month', 'year'], as_index=False).aggregate(aggregation_functions)
        df_month = df_month.sort_values(by="date")
        df_month.reset_index(drop=True, inplace=True)

        # df_month_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_months_pie WHERE user_id=%s", [user_id])
            results = cursor.fetchall()
        df_month_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'power', 'time',
                                                      'month', 'year', 'power_kWh', 'cost'])
        df_month_pie.drop(columns=['user_id'], inplace=True)

        values_pie = df_month_pie['power_kWh']
        pie_middletext = 'last 6 Months'

        # 3) For changing units of layout later on
        df3 = df_month
        df4 = df_month_pie

        dayActive = False
        weekActive = False
        monthActive = True
        yearActive = False
        average_kWh = average_df.loc[(
            average_df['type'] == 'monthly')]['avg_energy']
        average_cost = average_df.loc[(
            average_df['type'] == 'monthly')]['avg_cost']

        average_kWh = average_kWh.reset_index(drop=True)
        average_cost = average_cost.reset_index(drop=True)
    elif 'line-chart' in changed_id:
        if yearbtn > monthbtn and yearbtn > weekbtn and yearbtn > daybtn:

            # # df_hour_pie
            # with connection.cursor() as cursor:
            #     cursor.execute(
            #         "SELECT * FROM historical_today_pie WHERE user_id=%s", [user_id])
            #     results = cursor.fetchall()
            # df_hour_pie = pd.DataFrame(results, columns=['user_id', 'date', 'hours', 'device_type',
            #                                              'power', 'month', 'time', 'year', 'power_kWh', 'cost', 'date_AMPM'])
            # df_hour_pie.drop(columns=['user_id'], inplace=True)

            # df_year_bytype

            df_year_pie = pd.read_csv(
                ("{}/finished_apps/manager_csv/manager_df_year_pie.csv").format(BASE_DIR))
            df_year_bytype = copy.deepcopy(df_year_pie)

            x_value = clickData['points'][0]['x']

            # Get last 24 hours only
            df_to_process = df_year_bytype
            mask = (df_to_process['year'] == x_value)

            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]
            df_to_process.reset_index(drop=True, inplace=True)

            df4 = df_to_process
            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['cost']

            else:
                values_pie = df4['power_kWh']

        elif monthbtn > weekbtn and monthbtn > daybtn and monthbtn > yearbtn:

            # df_month_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_months_pie WHERE user_id=%s", [user_id])
                results = cursor.fetchall()
            df_month_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'month', 'time', 'power',
                                                          'year', 'power_kWh', 'cost'])
            df_month_pie.drop(columns=['user_id'], inplace=True)

            # df_month_bytype
            df_month_bytype = copy.deepcopy(df_month_pie)

            x_value = clickData['points'][0]['x']

            # Get last 24 hours only
            df_to_process = df_month_bytype

            mask = (df_to_process['month'] == x_value)
            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]

            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process

            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['cost']

            else:
                values_pie = df4['power_kWh']

        elif weekbtn > monthbtn and weekbtn > daybtn and weekbtn > yearbtn:

            # df_week_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [user_id])
                results = cursor.fetchall()
            df_week_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'week', 'power',
                                                         'month', 'time', 'year', 'power_kWh', 'cost'])
            df_week_pie.drop(columns=['user_id'], inplace=True)

            # df_week_bytype
            df_week_bytype = copy.deepcopy(df_week_pie)

            x_value = clickData['points'][0]['x']
            # Get last 24 hours only
            df_to_process = df_week_bytype
            mask = (df_to_process['week'] == x_value)
            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]

            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process
            pie_middletext = "Week of {}".format(x_value)

            if btnkwhdollars == False:
                values_pie = df4['cost']

            else:
                values_pie = df4['power_kWh']

        elif daybtn > monthbtn and daybtn > weekbtn and daybtn > yearbtn:

            # df_day_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_days_pie WHERE user_id=%s", [user_id])
                results = cursor.fetchall()
            df_day_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'date', 'power', 'month',
                                                        'time', 'year', 'power_kWh', 'cost'])
            df_day_pie.drop(columns=['user_id'], inplace=True)

            # df_day_bytype
            df_day_bytype = copy.deepcopy(df_day_pie)
            df_day_bytype = dayClickDataPiechart(df_day_bytype)

            x_value = clickData['points'][0]['x']

            print(x_value)
            # Get last 24 hours only
            # x_value_withoutzero = dt.datetime.strptime(
            #     x_value, '%d/%m').strftime('%d/%#m')  # - doesnt work for windows.
            df_to_process = df_day_bytype
            mask = (df_to_process['date_withoutYear'] == x_value)
            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]
            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process

            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['cost']

            else:
                values_pie = df4['power_kWh']

        else:

            # df_week_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [user_id])
                results = cursor.fetchall()
            df_week_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'week', 'power',
                                                         'month', 'time', 'year', 'power_kWh', 'cost'])
            df_week_pie.drop(columns=['user_id'], inplace=True)

            # df_week_bytype
            df_week_bytype = copy.deepcopy(df_week_pie)

            x_value = clickData['points'][0]['x']
            # Get last 24 hours only

            mask = (df_week_bytype['week'] == x_value)
            # Delete these row indexes from dataFrame
            df_week_bytype = df_week_bytype.loc[mask]

            df_week_bytype.reset_index(drop=True, inplace=True)
            df4 = df_week_bytype
            pie_middletext = "Week of {}".format(x_value)

            if btnkwhdollars == False:
                values_pie = df4['cost']

            else:
                values_pie = df4['power_kWh']

    # G) This ELSE will run on First Load of Page
    else:
        if 'btntoggle_units.on' in changed_id:
            pass

        else:

            # df_week_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [user_id])
                results = cursor.fetchall()
            df_week_pie = pd.DataFrame(results, columns=['user_id', 'device_type', 'week', 'power',
                                                         'month', 'time', 'year', 'power_kWh', 'cost'])
            df_week_pie.drop(columns=['user_id'], inplace=True)

            # df_week_bytype
            df_week_bytype = copy.deepcopy(df_week_pie)

            # df_week_line
            df_week_line = pd.read_csv(
                ("{}/finished_apps/manager_csv/manager_7m_weekly.csv").format(BASE_DIR))

            # sum power when combining rows.
            df_week_line = df_week_line.tail(4)

            aggregation_functions = {'power_kWh': 'sum',
                                     'cost': 'sum'}
            df_week_line = df_week_line.groupby(
                ['date'], as_index=False).aggregate(aggregation_functions)
            df_week_line.reset_index(drop=True, inplace=True)
            # with connection.cursor() as cursor:
            #     cursor.execute(
            #         "SELECT * FROM historical_weeks_line WHERE user_id=%s", [user_id])
            #     results = cursor.fetchall()
            # df_week_line = pd.DataFrame(results, columns=['user_id', 'week', 'power', 'month',
            #                                               'time', 'year', 'power_kWh', 'cost', 'date'])
            # df_week_line.drop(columns=['user_id'], inplace=True)

            df_to_sort = df_week_line
            df_to_sort['date'] = pd.to_datetime(df_to_sort.date)
            df_to_sort = df_to_sort.sort_values(by='date')
            df_to_sort = df_to_sort.reset_index(drop=True)
            values_pie = df_week_pie['power_kWh']
            pie_middletext = 'Last 4 weeks'
            # For changing units
            df3 = df_to_sort
            df4 = df_week_pie

            dayActive = False
            weekActive = True
            monthActive = False
            yearActive = False

            average_kWh = average_df.loc[(
                average_df['type'] == 'weekly')]['avg_energy']
            average_cost = average_df.loc[(
                average_df['type'] == 'weekly')]['avg_cost']

            average_kWh = average_kWh.reset_index(drop=True)
            average_cost = average_cost.reset_index(drop=True)
            print("AVERAGE COST WEEKLY GENERATED")

# H) After global variables initialised, generate graphs
    # 1. Generate Graphs

    piechart = px.pie(
        data_frame=df4,
        names='device_type',
        hole=.3,
        values=values_pie,
        color=df4['device_type'],
        color_discrete_map={
            'Desktop': '#4e73df',
            'Laptop': '#007bff',
            'Monitor': '#e74a3b',
            'Fan': '#1cc88a',
            'Tasklamp': '#17a2b8',
            'Others': '#f6c23e'
        }
    )

    # piechart.update_layout(
    #     margin=dict(l=0, r=0, t=0, b=0, pad=0),
    #     uniformtext_minsize=12,
    #     uniformtext_mode='hide',
    #     legend=dict(
    #         orientation="h",
    #         yanchor="top",
    #         xanchor="center",
    #         x=0.5,
    #         y=-0.1,
    #         font=dict(
    #             family='"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans -serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    #             size=11,
    #             color="black"
    #         ),
    #     ),

    # )

# I) Once graphs generated, implement Unit Changes based on Toggle and Misc Layout+Design changes

    # 2. Toggle False = kWh, True = $

    if btnkwhdollars == False:
        # units = 'Cost'
        units = '$'
        average_value = average_cost

        fig2 = go.Figure()

        if monthbtn > weekbtn and monthbtn > daybtn and monthbtn > yearbtn:
            x = df3['month']
            y = df3['cost']
            values_pie = df4['cost']

        elif weekbtn > monthbtn and weekbtn > daybtn and weekbtn > yearbtn:
            x = df3['date'].dt.strftime('%b %d')  # df3['week']
            y = df3['cost']
            values_pie = df4['cost']

        elif daybtn > monthbtn and daybtn > weekbtn and daybtn > yearbtn:
            x = df3['date_withoutYear']
            y = df3['cost']
            values_pie = df4['cost']

        elif yearbtn > monthbtn and yearbtn > weekbtn and yearbtn > daybtn:
            x = df3['year'].astype(str)
            y = df3['cost']
            values_pie = df4['cost']

        else:
            x = df3['date'].dt.strftime('%b %d')  # df3['week']
            y = df3['cost']
            values_pie = df4['cost']

        # Change to $ for pie and line graph

        fig2.update_yaxes(tickprefix='$ ')
        piechart.update_traces(
            values=values_pie,
            labels=df4['device_type'],
            textinfo='label+percent',
            hovertemplate='<b><span style="color: blue">%{label}</span></b><br>%{percent}<br>$ %{value}',

        )

        # End of $
    else:
        units = 'kWh'
        # units = 'Energy'
        average_value = average_kWh

        fig2 = go.Figure()

        if monthbtn > weekbtn and monthbtn > daybtn and monthbtn > yearbtn:
            x = df3['month']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif weekbtn > monthbtn and weekbtn > daybtn and weekbtn > yearbtn:
            x = df3['date'].dt.strftime('%b %d')
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif daybtn > monthbtn and daybtn > weekbtn and daybtn > yearbtn:
            x = df3['date_withoutYear']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif yearbtn > monthbtn and yearbtn > weekbtn and yearbtn > daybtn:
            x = df3['year'].astype(str)  # Actually HOURS_AMPM
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        else:
            x = df3['date'].dt.strftime('%b %d')
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        # Change to kWh for pie and line graph

        fig2.update_yaxes(ticksuffix=' kWh')

        piechart.update_traces(
            values=values_pie,
            labels=df4['device_type'],
            textinfo='label+percent',
            hovertemplate='<b><span style="color: blue">%{label}</span></b><br>%{percent}<br>%{value} kWh',

        )

    # 3. Final Layout Changes
    hovertemplate = (
        '<extra></extra>'+'<br><br><b>%{text}</b>')
    hovertemplate_average = (
        '<extra></extra>'+'<br><br><b>%{text}</b>')

    '''Added in Average Baseline'''
    fig2.add_trace(go.Scatter(
        mode='lines',
        y=average_value,
        x=x,
        line=dict(width=0.5, color='#ffea92'),
        fill='tozeroy',
        text=['<span style="font-size:20sp">{}<br></span><span><b>Historical Average: </b>{}<br></span><span style="color:blue"></span>'.format(
            "", (str(round(average_value[i], 4))+'kWh' if units == 'Energy' and len(average_value) > 1 else '$' + str(round(average_value[i], 4)) if units == '$' and len(average_value) > 1 else 'NO VALUE'))for i in range(len(x.to_list()))],
        hovertemplate=hovertemplate_average,

    )
    )
    # For the Line
    fig2 = fig2.add_trace(go.Scatter(x=x, y=y,
                                     mode='lines',


                                     hoverinfo='skip',
                                     line=dict(
                                          color='royalblue',
                                         width=4),
                                     selected=dict(
                                         marker=dict(size=30),
                                     ),
                                     )
                          )

    # Create condition for Red or Green Marker
    def SetColor(y, average_value):
        pointsColorList = []
        for i, j in zip(y, average_value):
            if i > j:
                color = "#FF0000"
                pointsColorList.append(color)

            elif i == j:
                color = "yellow"
                pointsColorList.append(color)

            else:
                color = "#54ff00"
                pointsColorList.append(color)

        return pointsColorList
    pointsColorList = SetColor(y, average_value)

    # For Orange Markers
    fig2.add_trace(go.Scatter(
        mode='markers',
        x=x,
        y=y,
        hovertemplate=hovertemplate,
        text=['<span style="font-size:20sp">{}<br></span><span><b>Total: </b>{}<br></span><span style="color:blue">Click to see the <br>plug load breakdown!</span>'.format(
            x[i], (str(round(y[i], 4))+'kWh' if units == 'Energy' and len(y) > 1 else '$' + str(round(y[i], 4)) if units == '$' and len(y) > 1 else 'NO VALUE')) for i in range(len(x.to_list()))],

        hoverlabel=dict(bgcolor="white"),
        marker=dict(
            color=pointsColorList,
            size=14,
            # For black circle around markers
            line=dict(
                width=2
            ),
        ),
        showlegend=False,
    ))

    piechart.update_layout(
        margin=dict(l=0, r=0, t=0, b=5, pad=0),
        uniformtext_minsize=12,
        uniformtext_mode='hide',
        showlegend=True,
        hoverlabel=dict(
            bgcolor="white",
        ),
        # Add annotations in the center of the donut pies.
        # annotations=[dict(text=pie_middletext, x=0.5, y=0.5,
        #                   font_size=20, showarrow=False)]
        # height=210,
        # width=200,
        legend=dict(
            orientation="h",
            yanchor="top",
            xanchor="center",
            x=0.5,
            y=-0.1,
            font=dict(
                family='"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans -serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                size=11,
                color="black"
            ),

        )

    )
    piechart.update_traces(
        sort=False,
        textposition='inside'

    )

    fig2.update_xaxes(showspikes=True, spikecolor="black",
                      spikesnap="hovered data", tickangle=0,
                      spikethickness=2,
                      tickvals=x,
                      )
    fig2.update_layout(
        spikedistance=1000,
        hoverdistance=100,
        margin=dict(l=0, r=0, t=0, b=0, pad=0),
        # height=230,
        # width=350,
        showlegend=False,
        hovermode='x'


    )
    piechart.update_layout(
        legend=dict(
            orientation="h",
            yanchor="top",
            xanchor="center",
            x=0.5,
            y=-0.1,
            font=dict(
                family='"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans -serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                size=11,
                color="black"
            ),

        )
    )

    # 4. Return all graphs
    return fig2, piechart, ("Aggregated {}".format(units), html.Br(), "{}".format(pie_middletext)), ("{} Breakdown".format(units), html.Br(), "{}".format(pie_middletext)), dayActive, weekActive,    monthActive,   yearActive
