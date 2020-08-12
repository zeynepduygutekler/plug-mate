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

# A) Function to create new essential columns


end_date = '24/7/2020'

# @profile

# Manipulate and Initialise variables for later


def initialise_variables():
    # Initialise some variables
    global start, end
    global singapore_tariff_rate
    singapore_tariff_rate = 0.201
    end = end_date
    end = dt.datetime.strptime(end, '%d/%m/%Y')
    start = end - dt.timedelta(7)


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


initialise_variables()


# B) Dash App initialisation
app = DjangoDash('historical_consumption',
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
            dbc.Row([dbc.Col([
                dbc.Col([

                    html.Div([

                        daq.BooleanSwitch(id='btntoggle_units', on=False, color='#e6e6e6')],

                        style={'width': 'fit-content'}
                    ),
                    dbc.Button('Today', id='hour', n_clicks=0, n_clicks_timestamp=0, style={
                        'width': '100px'}, color="primary", className="mr-1"),
                    dbc.Button('Days', id='day', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                               color="primary",
                               className="mr-1"),
                    dbc.Button('Weeks', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                               color="primary", className="mr-1", active=True),
                    dbc.Button('Months', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                               color="primary", className="mr-1")], style={'text-align': 'right',
                                                                           'margin': 'auto'}, width=12),

            ], style={'margin': 'auto'}, width=2),
                dbc.Col([
                    dbc.Row([
                        dbc.Col([
                            html.H5("Aggregated Energy", id='lineTitle',
                                    style={'margin-left': '5%'}),
                            html.Div(dbc.Spinner(color="primary", id="loadingLine",
                                                 children=[
                                                     dcc.Graph(id='line-chart', config={'displayModeBar': False}, clear_on_unhover=True)],
                                                 spinner_style={"width": "3rem", "height": "3rem"}))

                        ], style={'text-align': 'center'}, width=6),
                        dbc.Col([
                            html.H5("Energy Breakdown Today", id='pieTitle'),
                            html.Div(
                                dbc.Spinner(color="primary", id="loadingPie",
                                            children=[
                                                dcc.Graph(id='pie-chart-2', config={'displayModeBar': False})],
                                            spinner_style={"width": "3rem", "height": "3rem"})),

                        ], width=6, style={'text-align': 'center'}),
                    ], style={'justify-content': 'center', 'padding-top': '1%', 'margin': 'auto', 'margin-left': '0px'}),
                ], width=10),
            ]),

        ], style={'width': '97%'}),
        dcc.Interval(
            id='interval-component',
            interval=0,  # in milliseconds
            max_intervals=1
        )
    ], style={'height': '320px'})

# D) This callback activates upon HOUR DAY WEEK MONTH click


@ app.callback(
    [dd.Output('line-chart', 'figure'),
     dd.Output('pie-chart-2', 'figure'),
     dd.Output('lineTitle', 'children'),
     dd.Output('pieTitle', 'children'),
     dd.Output('day', 'active'),
     dd.Output('week', 'active'),
     dd.Output('month', 'active'),
     dd.Output('hour', 'active')],
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
     dd.State('month', 'n_clicks_timestamp')])
# E) Callback Function when Day Hour Month or Week clicked
# @profile
def update_graph_DayMonthYear(btn1_click, btn2_click, btn3_click, btn4_click, btnkwhdollars,
                              clickData, interval,
                              hoverData, hourbtn, daybtn, weekbtn, monthbtn):
    global df_hour, df_hour_pie, df_week_line, df_week_pie, start, end, end_date
    global df3, df4, piechart
    global fig2
    global start, end
    global values_pie, pie_middletext
    global dayActive, weekActive, monthActive, hourActive
    global df_hour_bytype, df_month_bytype, df_day_bytype, df_week_bytype

    # F) Search for the most recent changed ID to know if hour day week or Month
    # checks the list of id that recently triggered a callback in dash.callback_context.triggered list
    changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]

    if 'hour' in changed_id:
        # df_hour
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_today_line WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_hour = pd.DataFrame(results, columns=colnames)
        df_hour.drop(columns=['user_id'], inplace=True)

        # df_hour_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_today_pie WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_hour_pie = pd.DataFrame(results, columns=colnames)
        df_hour_pie.drop(columns=['user_id'], inplace=True)

        # Pie Chart values
        values_pie = df_hour_pie['power_kWh']
        pie_middletext = 'Today'

        # For changing units
        df3 = df_hour

        df4 = df_hour_pie
        dayActive = False
        weekActive = False
        monthActive = False
        hourActive = True

    elif 'day' in changed_id:

        # df_day
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_days_line WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_day = pd.DataFrame(results, columns=colnames)
        df_day.drop(columns=['user_id'], inplace=True)

        # df_day_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_days_pie WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_day_pie = pd.DataFrame(results, columns=colnames)
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
        hourActive = False

    elif 'week' in changed_id:
        # df_week_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_week_pie = pd.DataFrame(results, columns=colnames)
        df_week_pie.drop(columns=['user_id'], inplace=True)

        # df_week_bytype
        df_week_bytype = copy.deepcopy(df_week_pie)

        # df_week_line
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_weeks_line WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_week_line = pd.DataFrame(results, columns=colnames)
        df_week_line.drop(columns=['user_id'], inplace=True)

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
        hourActive = False

    elif 'month' in changed_id:

        # df_month
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_months_line WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_month = pd.DataFrame(results, columns=colnames)
        df_month.drop(columns=['user_id'], inplace=True)

        # df_month_pie
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historical_months_pie WHERE user_id=%s", [1])
            results = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
        df_month_pie = pd.DataFrame(results, columns=colnames)
        df_month_pie.drop(columns=['user_id'], inplace=True)

        values_pie = df_month_pie['power_kWh']
        pie_middletext = 'last 6 Months'

        # 3) For changing units of layout later on
        df3 = df_month
        df4 = df_month_pie

        dayActive = False
        weekActive = False
        monthActive = True
        hourActive = False

    elif 'line-chart' in changed_id:
        if hourbtn > monthbtn and hourbtn > weekbtn and hourbtn > daybtn:

            # df_hour_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_today_pie WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_hour_pie = pd.DataFrame(results, columns=colnames)
            df_hour_pie.drop(columns=['user_id'], inplace=True)

            # df_hour_bytype
            df_hour_bytype = copy.deepcopy(df_hour_pie)

            x_value = hoverData['points'][0]['x']
            xvalue_tohours = dt.datetime.strptime(
                x_value, '%I:%M%p').strftime('%H')

            # Get last 24 hours only
            df_to_process = df_hour_bytype
            mask = (df_to_process['hours'] == xvalue_tohours)

            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]
            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process
            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif monthbtn > weekbtn and monthbtn > daybtn and monthbtn > hourbtn:

            # df_month_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_months_pie WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_month_pie = pd.DataFrame(results, columns=colnames)
            df_month_pie.drop(columns=['user_id'], inplace=True)

            # df_month_bytype
            df_month_bytype = copy.deepcopy(df_month_pie)

            x_value = hoverData['points'][0]['x']

            # Get last 24 hours only
            df_to_process = df_month_bytype

            mask = (df_to_process['month'] == x_value)
            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]

            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process

            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif weekbtn > monthbtn and weekbtn > daybtn and weekbtn > hourbtn:

            # df_week_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_week_pie = pd.DataFrame(results, columns=colnames)
            df_week_pie.drop(columns=['user_id'], inplace=True)

            # df_week_bytype
            df_week_bytype = copy.deepcopy(df_week_pie)

            x_value = hoverData['points'][0]['x']
            # Get last 24 hours only
            df_to_process = df_week_bytype
            mask = (df_to_process['week'] == x_value)
            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]

            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process
            pie_middletext = "Week of {}".format(x_value)

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif daybtn > monthbtn and daybtn > weekbtn and daybtn > hourbtn:

            # df_day_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_days_pie WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_day_pie = pd.DataFrame(results, columns=colnames)
            df_day_pie.drop(columns=['user_id'], inplace=True)

            # df_day_bytype
            df_day_bytype = copy.deepcopy(df_day_pie)
            df_day_bytype = dayClickDataPiechart(df_day_bytype)

            x_value = hoverData['points'][0]['x']
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
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        else:

            # df_week_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_week_pie = pd.DataFrame(results, columns=colnames)
            df_week_pie.drop(columns=['user_id'], inplace=True)

            # df_week_bytype
            df_week_bytype = copy.deepcopy(df_week_pie)

            x_value = hoverData['points'][0]['x']
            # Get last 24 hours only

            mask = (df_week_bytype['week'] == x_value)
            # Delete these row indexes from dataFrame
            df_week_bytype = df_week_bytype.loc[mask]

            df_week_bytype.reset_index(drop=True, inplace=True)
            df4 = df_week_bytype
            pie_middletext = "Week of {}".format(x_value)

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']
    # G) This ELSE will run on First Load of Page

    else:
        if 'btntoggle_units.on' in changed_id:
            pass

        else:

            # df_week_pie
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_pie WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_week_pie = pd.DataFrame(results, columns=colnames)
            df_week_pie.drop(columns=['user_id'], inplace=True)

            # df_week_bytype
            df_week_bytype = copy.deepcopy(df_week_pie)

            # df_week_line
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM historical_weeks_line WHERE user_id=%s", [1])
                results = cursor.fetchall()
                colnames = [desc[0] for desc in cursor.description]
            df_week_line = pd.DataFrame(results, columns=colnames)
            df_week_line.drop(columns=['user_id'], inplace=True)

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
            hourActive = False


# H) After global variables initialised, generate graphs
    # 1. Generate Graphs

    piechart = px.pie(
        data_frame=df4,
        names='device_type',
        hole=.3,
        values=values_pie,
        color=df4['device_type'],
        color_discrete_map={
            'Desktop': 'primary',
            'Laptop': 'success',
            'Monitor': 'danger',
            'Fan': 'warning',
            'Tasklamp': 'info',
            'Others': '#6610f2'
        }
    )

    piechart.update_layout(
        margin=dict(l=0, r=0, t=0, b=0, pad=0),
        uniformtext_minsize=12,
        uniformtext_mode='hide',
        height=180,
        width=240,
    )
    piechart.update_traces(textposition='inside')

# I) Once graphs generated, implement Unit Changes based on Toggle and Misc Layout+Design changes

    # 2. Toggle False = kWh, True = $

    if btnkwhdollars == False:
        units = 'Energy'

        fig2 = go.Figure()

        if monthbtn > weekbtn and monthbtn > daybtn and monthbtn > hourbtn:
            x = df3['month']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif weekbtn > monthbtn and weekbtn > daybtn and weekbtn > hourbtn:
            x = df3['week']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif daybtn > monthbtn and daybtn > weekbtn and daybtn > hourbtn:
            x = df3['date_withoutYear']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif hourbtn > monthbtn and hourbtn > weekbtn and hourbtn > daybtn:
            x = df3['dates_AMPM']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']
            fig2.update_xaxes(
                ticktext=["12AM", "", "", "3AM", "", "", "6AM", "", "", "9AM",
                          "", "", "12PM", "", "", "3PM", "", "", "6PM", "", "", "9PM", "", ""],
                tickvals=["12:00AM", "01:00AM", "02:00AM", "03:00AM", "04:00AM", "05:00AM",
                          "06:00AM", "07:00AM", "08:00AM", "09:00AM", "10:00AM", "11:00AM", "12:00PM",
                          "01:00PM", "02:00PM", "03:00PM", "04:00PM", "05:00PM", "06:00PM", "07:00PM", "08:00PM", "09:00PM",
                          "10:00PM", "11:00PM"],
            )

        else:
            x = df3['week']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        # Change to kWh for pie and line graph

        fig2.update_yaxes(ticksuffix=' kWh')

        piechart.update_traces(
            values=values_pie,
            labels=df4['device_type'],
            textinfo='label+percent',
            hovertemplate="%{label}<br>%{percent}<br>%{value} kWh",

        )
    else:

        units = 'Cost'
        fig2 = go.Figure()

        if monthbtn > weekbtn and monthbtn > daybtn and monthbtn > hourbtn:
            x = df3['month']
            y = df3['cost']
            values_pie = df4['cost']

        elif weekbtn > monthbtn and weekbtn > daybtn and weekbtn > hourbtn:
            x = df3['week']
            y = df3['cost']
            values_pie = df4['cost']

        elif daybtn > monthbtn and daybtn > weekbtn and daybtn > hourbtn:
            x = df3['date_withoutYear']
            y = df3['cost']
            values_pie = df4['cost']

        elif hourbtn > monthbtn and hourbtn > weekbtn and hourbtn > daybtn:
            x = df3['dates_AMPM']
            y = df3['cost']
            values_pie = df4['cost']
            fig2.update_xaxes(
                ticktext=["12AM", "", "", "3AM", "", "", "6AM", "", "", "9AM",
                          "", "", "12PM", "", "", "3PM", "", "", "6PM", "", "", "9PM", "", ""],
                tickvals=["12:00AM", "01:00AM", "02:00AM", "03:00AM", "04:00AM", "05:00AM",
                          "06:00AM", "07:00AM", "08:00AM", "09:00AM", "10:00AM", "11:00AM", "12:00PM",
                          "01:00PM", "02:00PM", "03:00PM", "04:00PM", "05:00PM", "06:00PM", "07:00PM", "08:00PM", "09:00PM",
                          "10:00PM", "11:00PM"],
            )
        else:
            x = df3['week']
            y = df3['cost']
            values_pie = df4['cost']

        # Change to $ for pie and line graph

        fig2.update_yaxes(tickprefix='$ ')
        piechart.update_traces(
            values=values_pie,
            labels=df4['device_type'],
            textinfo='label+percent',
            hovertemplate="%{label}<br>%{percent}<br>$ %{value}",

        )

        # End of $

    # 3. Final Layout Changes
    fig2 = fig2.add_trace(go.Scattergl(x=x, y=y,
                                       hovertemplate='',
                                       line=dict(
                                           color='royalblue',
                                           width=4),
                                       selected=dict(
                                           marker=dict(size=30)
                                       ),
                                       )
                          )

    fig2 = fig2.add_trace(go.Scattergl(
        mode='markers',
        x=x,
        y=y,
        hovertemplate='',
        marker=dict(
            size=12,
            line=dict(
                # color='LightSkyBlue',
                width=2
            ),
        ),
        showlegend=False,
    ))

    fig2.update_layout(
        xaxis_title="",
        yaxis_title="",
        yaxis=dict(showgrid=True, zeroline=False),
        hoverlabel=dict(bgcolor="white"),
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
        ),

    )

    piechart.update_layout(

        showlegend=False,
        hoverlabel=dict(
            bgcolor="white",
        ),
        # Add annotations in the center of the donut pies.
        # annotations=[dict(text=pie_middletext, x=0.5, y=0.5,
        #                   font_size=20, showarrow=False)]
        height=200,

    )
    piechart.update_traces(
        sort=False,
    )

    hovertemplate = (
        '<b>Total: </b>%{y}<extra></extra>'+'<br><br><b>%{text}</b>')

    fig2.add_trace(
        go.Scatter(
            x=x,
            y=y,
            hovertemplate=hovertemplate,
            text=['Click to see the <br>plug load breakdown!'.format(
                i + 1) for i in range(24)],
            # fill='tozeroy',
            # mode='lines',
            # line=dict(width=0),
        ))
    fig2.update_xaxes(showspikes=True, spikecolor="black",
                      spikesnap="hovered data", tickangle=0,
                      spikethickness=2,)
    fig2.update_layout(
        spikedistance=1000,
        hoverdistance=100,
        margin=dict(l=0, r=0, t=45, b=0, pad=0),
        height=240,

    )
    # 4. Return all graphs
    # print("DONE SHOWING GRAPHS <======", str(dt.datetime.now()))

    return fig2, piechart, ("Aggregated {}".format(units), html.Br(), "{}".format(pie_middletext)), ("{} Breakdown".format(units), html.Br(), "{}".format(pie_middletext)), dayActive, weekActive,    monthActive,   hourActive
