from memory_profiler import profile
from django_plotly_dash import DjangoDash
from django.db import connection
import os
import glob
import dash
import gc
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
import gc
gc.collect()

pio.templates.default = "simple_white"

end_date = '24/7/2020'

singapore_tariff_rate = 0.201

# A) CREATE ALL NECESSARY FUNCTIONS

# A1. IMPORTING DATA


# @profile
def initialise_variables():
    global w, x, y, z
    w, x, y, z = (0, 0, 0, 0)

    # Initialise some variables
    global user1
    global singapore_tariff_rate

    # Manipulate Data
#     """ INSERT SQL CODE """
#     user1 = pd.concat(map(pd.read_csv, glob.glob(
#         os.path.join('', 'plug_mate_app/dash_apps/finished_apps/aggregated*.csv'))))
#     """ DONE SQL CODE """

    """ INSERT SQL CODE """
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM power_energy_consumption "
                       "WHERE user_id=%s AND "
                       "date >= date_trunc('month', now()) - interval '6 month' AND "
                       "date < date_trunc('month', now())", [1,])
        results = cursor.fetchall()

    user1 = pd.DataFrame(results, columns=['date','time','unix_time','meter_id','user_id',
                                           'energy','power','device_state','type'])

    # user1 = pd.read_csv(os.path.join(
    #     '', 'plug_mate_app/dash_apps/finished_apps/generator_6m.csv'))
    """ DONE SQL CODE """

    # user1
    #           date     time   unix_time  power              id      type
    # 0    28/2/2020  0:32:24  1582849944  47.52   desktop_user1   desktop
    # 1    28/2/2020  0:33:24  1582850004  47.52   desktop_user1   desktop
    # 2    28/2/2020  0:34:25  1582850065  47.52   desktop_user1   desktop
    # 3    28/2/2020  0:35:24  1582850124  47.52   desktop_user1   desktop
    # 4    28/2/2020  0:36:25  1582850185  47.52   desktop_user1   desktop
    def generate_kWh(val):
        return round(val/1000, 3)

    def generate_cost(kwh):
        return round(kwh*singapore_tariff_rate, 3)

    def type_caps(type1):
        return string.capwords(type1)

    # Extract column as a list and iterate over to prevent using large dataset
    power_row = user1['power']
    type_row = user1['type']
    user1['power_kWh'] = [generate_kWh(item) for item in power_row]
    power_kWh_row = user1['power_kWh']
    user1['cost'] = [generate_cost(item) for item in power_kWh_row]
    user1['type'] = [type_caps(item) for item in type_row]
    # print(user1, "no.2")

    #               date     time   unix_time  power              id      type  power_kWh   cost
    # 0    28/2/2020  0:32:24  1582849944  47.52   desktop_user1   Desktop      0.048  0.010
    # 1    28/2/2020  0:33:24  1582850004  47.52   desktop_user1   Desktop      0.048  0.010
    # 2    28/2/2020  0:34:25  1582850065  47.52   desktop_user1   Desktop      0.048  0.010
    # 3    28/2/2020  0:35:24  1582850124  47.52   desktop_user1   Desktop      0.048  0.010
    # 4    28/2/2020  0:36:25  1582850185  47.52   desktop_user1   Desktop      0.048  0.010
    # ..         ...      ...         ...    ...             ...       ...        ...    ...
    # 576  19/3/2020  2:56:22  1584586582   6.51  tasklamp_user1  Tasklamp      0.007  0.001
    # 577  19/3/2020  2:57:22  1584586642   8.66  tasklamp_user1  Tasklamp      0.009  0.002
    # no.2

# A2. FILTERING FUNCTIONS BELOW


# @profile
def generate_month(unix_time):
    return dt.datetime.utcfromtimestamp(unix_time).strftime('%b')


# @profile
def generate_year(unix_time):
    return dt.datetime.utcfromtimestamp(unix_time).strftime('%Y')


# @profile
def generate_dateAMPM(unix_time):
    return dt.datetime.utcfromtimestamp(unix_time).strftime('%I:%M%p')


# @profile
def generate_hour(unix_time):
    return dt.datetime.utcfromtimestamp(unix_time).strftime('%H')


# @profile
def monthFunction():
    global df_month, df_month_pie, w

    if w == 0:
        w += 1
        # START OF MONTH FUNCTION
        # 1) For Line Chart
        # Create new dataframe
        df_month = user1

        # Filter data for Last 6 months
        # Get names of indexes for which column Date only has values 6 months before 1/2/2020
        df_month['date'] = pd.to_datetime(df_month['date'])
        end = end_date
        end_first_day_date = dt.datetime.strptime(
            end, '%d/%m/%Y').replace(day=1)

        start = end_first_day_date - \
            dateutil.relativedelta.relativedelta(months=6)
        mask = (df_month['date'] > start) & (df_month['date'] <= end)
        # Delete these row indexes from dataFrame
        df_month = df_month.loc[mask]
        df_month.reset_index(drop=True, inplace=True)

        # Aggregate data by date first before filtering months

        aggregation_functions = {'power': 'sum', 'time': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum', 'unix_time': 'first'}  # sum power when combining rows.
        df_month = df_month.groupby(
            ['date'], as_index=False).aggregate(aggregation_functions)
        df_month.reset_index(drop=True, inplace=True)

        """ INSERT SQL CODE """

        # Get column unix_time
        unix_time_row = df_month['unix_time']

        # Generate month, year columns based on unix_time
        df_month['month'] = [generate_month(item) for item in unix_time_row]
        df_month['year'] = [generate_year(item) for item in unix_time_row]

        """ DONE SQL CODE """

        # Aggregate Data into Months based on last 6 months

        aggregation_functions = {'power': 'sum', 'time': 'first',
                                 'power_kWh': 'sum', 'unix_time': 'first',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month = df_month.groupby(
            ['month', 'year'], as_index=False).aggregate(aggregation_functions)
        df_month.reset_index(drop=True, inplace=True)
        df_month = df_month.sort_values(
            by=['unix_time'], ascending=True, ignore_index=True)
        # 2) For Pie Chart

        """ INSERT SQL CODE """
        df_month_pie = user1
        unix_time_row = df_month_pie['unix_time']
        df_month_pie['month'] = [generate_month(
            item) for item in unix_time_row]
        df_month_pie['year'] = [generate_year(item) for item in unix_time_row]
        """ DONE SQL CODE """

        # Aggregate data by date first before filtering months

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month_pie = df_month_pie.groupby(
            ['date', 'type'], as_index=False).aggregate(aggregation_functions)
        df_month_pie.reset_index(drop=True, inplace=True)

        # Filter data for Last 6 months
        # Get names of indexes for which column Date only has values 6 months before 1/2/2020
        df_month_pie['date'] = pd.to_datetime(df_month_pie['date'])
        end = end_date
        end_first_day_date = dt.datetime.strptime(
            end, '%d/%m/%Y').replace(day=1)

        start = end_first_day_date - \
            dateutil.relativedelta.relativedelta(months=6)
        mask = (df_month_pie['date'] > start) & (df_month_pie['date'] <= end)
        # Delete these row indexes from dataFrame
        df_month_pie = df_month_pie.loc[mask]
        df_month_pie.reset_index(drop=True, inplace=True)

        # Aggregate Data into Months based on last 6 months

        aggregation_functions = {'power': 'sum', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_month_pie = df_month_pie.groupby(
            ['type'], as_index=False).aggregate(aggregation_functions)
        df_month_pie.reset_index(drop=True, inplace=True)

        # END OF MONTH FUNCTION
    else:
        pass

    return df_month, df_month_pie


# @profile
def dayFunction():
    global df_day, df_day_pie, x
    if x == 0:
        x += 1
        # Start of Day function
        # Line Chart

        # Create new dataframe
        df_day = user1

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

        # Aggregate data

        # sum power when combining rows.
        aggregation_functions = {'power': 'sum', 'time': 'first',
                                 'power_kWh': 'sum', 'cost': 'sum', 'unix_time': 'first'}
        df_day = df_day.groupby(['date'], as_index=False).aggregate(
            aggregation_functions)
        df_day.reset_index(drop=True, inplace=True)
        """ INSERT SQL CODE """

        unix_time_row = df_day['unix_time']
        df_day['month'] = [generate_month(item) for item in unix_time_row]
        df_day['year'] = [generate_year(item) for item in unix_time_row]
        """ DONE SQL CODE """
        # Optional Convert to %d/%m/%Y
        df_day['date_withoutYear'] = df_day['date'].dt.strftime('%d/%m')
        # Pie Chart

        # Create new instance of df
        df_day_pie = user1

        # Get names of indexes for which column Date only has values 7 days before 29/2/2020
        df_day_pie['date'] = pd.to_datetime(df_day_pie['date'])
        end = end_date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        start = end - dt.timedelta(7)
        mask = (df_day_pie['date'] > start) & (df_day_pie['date'] <= end)
        # Delete these row indexes from dataFrame
        df_day_pie = df_day_pie.loc[mask]
        df_day_pie.reset_index(drop=True, inplace=True)

        """ INSERT SQL CODE """

        unix_time_row = df_day_pie['unix_time']
        df_day_pie['month'] = [generate_month(item) for item in unix_time_row]
        df_day_pie['year'] = [generate_year(item) for item in unix_time_row]
        """ DONE SQL CODE """

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_day_pie = df_day_pie.groupby(
            ['date', 'type'], as_index=False).aggregate(aggregation_functions)
        df_day_pie.reset_index(drop=True, inplace=True)

        # Aggregate data based on type for past 7 days

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_day_pie = df_day_pie.groupby(
            ['type'], as_index=False).aggregate(aggregation_functions)
        df_day_pie.reset_index(drop=True, inplace=True)
        # End of day function

    else:
        pass
    return df_day, df_day_pie


# @profile
def hourFunction():
    global df_hour_pie, df_hour, y
    if y == 0:
        y += 1
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

        """ INSERT SQL CODE """

        unix_time_row = df_hour['unix_time']

        df_hour['month'] = [generate_month(item) for item in unix_time_row]
        df_hour['year'] = [generate_year(item) for item in unix_time_row]
        df_hour['dates_AMPM'] = [generate_dateAMPM(
            item) for item in unix_time_row]
        df_hour['hours'] = [generate_hour(item) for item in unix_time_row]

        """ DONE SQL CODE """

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
        df_hour_pie['date'] = pd.to_datetime(df_hour_pie['date'])
        end = end_date  # String of todays date
        end = dt.datetime.strptime(end, '%d/%m/%Y')
        mask = (df_hour_pie['date'] == end)

        # Delete these row indexes from dataFrame
        df_hour_pie = df_hour_pie.loc[mask]
        df_hour_pie.reset_index(drop=True, inplace=True)

        """ INSERT SQL CODE """
        unix_time_row = df_hour_pie['unix_time']
        df_hour_pie['month'] = [generate_month(item) for item in unix_time_row]
        df_hour_pie['year'] = [generate_year(item) for item in unix_time_row]
        df_hour_pie['dates_AMPM'] = [
            generate_dateAMPM(item) for item in unix_time_row]
        df_hour_pie['hours'] = [generate_hour(item) for item in unix_time_row]
        """ DONE SQL CODE """

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'dates_AMPM': 'first'}  # sum power when combining rows.
        df_hour_pie = df_hour_pie.groupby(
            ['date', 'hours', 'type'], as_index=False).aggregate(aggregation_functions)
        df_hour_pie.reset_index(drop=True, inplace=True)

        # Optional Convert to %d/%m/%Y
        df_hour_pie['date'] = df_hour_pie['date'].dt.strftime('%d/%m/%Y')
        # End of hour function

    else:
        pass
    return df_hour, df_hour_pie


# @profile
def weekFunction():
    global df_week_pie, df_week_line, df_week, start, end, z

    if z == 0:
        z += 1
        # Start of week function

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

        """ INSERT SQL CODE """
        unix_time_row = df_week['unix_time']
        df_week['month'] = [generate_month(item) for item in unix_time_row]
        df_week['year'] = [generate_year(item) for item in unix_time_row]
        """ DONE SQL CODE """
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
        """ INSERT SQL CODE """
        df_week_pie = df_week  # already filtered past 4 weeks

        """ DONE SQL CODE """

        # Aggregate data

        aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                 'year': 'first', 'power_kWh': 'sum',
                                 'cost': 'sum'}  # sum power when combining rows.
        df_week_pie = df_week_pie.groupby(
            ['type'], as_index=False).aggregate(aggregation_functions)
        df_week_pie.reset_index(drop=True, inplace=True)
        z += 1

        # End of week function
    else:
        pass
    return df_week, df_week_pie, df_week_line, start, end


# @profile
def hourClickDataPiechart():
    # Aggregate df_hour_bytype separating type of device
    df_hour_bytype = user1

    df_hour_bytype['date'] = pd.to_datetime(df_hour_bytype['date'])
    end = end_date  # String of todays date
    end = dt.datetime.strptime(end, '%d/%m/%Y')
    mask = (df_hour_bytype['date'] == end)

    # Delete these row indexes from dataFrame
    df_hour_bytype = df_hour_bytype.loc[mask]
    df_hour_bytype.reset_index(drop=True, inplace=True)

    # Add essential columns
    """ INSERT SQL CODE """

    unix_time_row = df_hour_bytype['unix_time']
    df_hour_bytype['month'] = [generate_month(item) for item in unix_time_row]
    df_hour_bytype['year'] = [generate_year(item) for item in unix_time_row]
    df_hour_bytype['dates_AMPM'] = [
        generate_dateAMPM(item) for item in unix_time_row]
    df_hour_bytype['hours'] = [generate_hour(item) for item in unix_time_row]

    """ DONE SQL CODE """

    # Aggregate df_hour_bytype separating type of device
    aggregation_functions = {'power': 'sum', 'time': 'first', 'power_kWh': 'sum', 'cost': 'sum',
                             'dates_AMPM': 'first'}  # sum power when combining rows.
    df_hour_bytype = df_hour_bytype.groupby(['type', 'date', 'hours'], as_index=False).aggregate(
        aggregation_functions)
    df_hour_bytype.reset_index(drop=True, inplace=True)

    return df_hour_bytype


# @profile
def weekClickDataPiechart():
    global df_week
    df_week_bytype = df_week

    # Aggregate df_week_bytype separating type of device

    aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                             'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'date': 'first'}  # sum power when combining rows.
    df_week_bytype = df_week_bytype.groupby(
        ['week', 'type'], as_index=False).aggregate(aggregation_functions)
    df_week_bytype.reset_index(drop=True, inplace=True)

    return df_week_bytype


# @profile
def monthClickDataPiechart():
    # Aggregate df_month_bytype separating type of device
    """ INSERT SQL CODE """
    df_month_bytype = user1
    unix_time_row = df_month_bytype['unix_time']
    df_month_bytype['month'] = [generate_month(item) for item in unix_time_row]
    df_month_bytype['year'] = [generate_year(item) for item in unix_time_row]
    """ DONE SQL CODE """

    # Filter data for Last 6 months
    # Get names of indexes for which column Date only has values 6 months before 1/2/2020
    df_month_bytype['date'] = pd.to_datetime(df_month_bytype['date'])
    end = end_date
    end_first_day_date = dt.datetime.strptime(
        end, '%d/%m/%Y').replace(day=1)

    start = end_first_day_date - \
        dateutil.relativedelta.relativedelta(months=6)
    mask = (df_month_bytype['date'] > start) & (df_month_bytype['date'] <= end)
    # Delete these row indexes from dataFrame
    df_month_bytype = df_month_bytype.loc[mask]
    df_month_bytype.reset_index(drop=True, inplace=True)

    # Aggregate df_month_bytype separating type of device

    aggregation_functions = {'power': 'sum', 'time': 'first',
                             'power_kWh': 'sum', 'cost': 'sum'}  # sum power when combining rows.
    df_month_bytype = df_month_bytype.groupby(['type', 'month', 'year'], as_index=False).aggregate(
        aggregation_functions)
    df_month_bytype.reset_index(drop=True, inplace=True)

    return df_month_bytype


# @profile
def dayClickDataPiechart():
    # Aggregate df_day_bytype separating type of device
    """ INSERT SQL CODE """
    df_day_bytype = user1
    unix_time_row = df_day_bytype['unix_time']
    df_day_bytype['hours'] = [generate_hour(item) for item in unix_time_row]
    df_day_bytype['dates_AMPM'] = [
        generate_dateAMPM(item) for item in unix_time_row]
    """ DONE SQL CODE """

    aggregation_functions = {'power': 'sum', 'time': 'first',
                             'power_kWh': 'sum', 'cost': 'sum',
                             'dates_AMPM': 'first'}  # sum power when combining rows.
    df_day_bytype = df_day_bytype.groupby(
        ['type', 'date', 'hours'], as_index=False).aggregate(aggregation_functions)
    df_day_bytype.reset_index(drop=True, inplace=True)
    # Optional Convert to %d/%m/%Y
    df_day_bytype['date_withoutYear'] = df_day_bytype['date'].dt.strftime(
        '%d/%m')
    return df_day_bytype


initialise_variables()
df_hour, df_hour_pie = hourFunction()
df_week, df_week_pie, df_week_line, start, end = weekFunction()
df_month, df_month_pie = monthFunction()
df_day, df_day_pie = dayFunction()


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
            # html.Link(
            #     rel='stylesheet',
            #     href='/static/assets/custom_style.css'
            # ),

            dbc.Row([html.H5("View By:", id='lineTitle')],
                    style={'justify-content': 'center', 'margin': 'auto'}),

            dbc.Row([dbc.Col([
                dbc.Button('Today', id='hour', n_clicks=0, n_clicks_timestamp=0, style={
                    'width': '100px'}, color="primary", className="mr-1"),
                dbc.Button('Days', id='day', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                           color="primary",
                           className="mr-1"),
                dbc.Button('Weeks', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                           color="primary", className="mr-1", active=True),
                dbc.Button('Months', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                           color="primary", className="mr-1")], style={'text-align': 'right',
                                                                       'margin': 'auto'}, width=7),
                dbc.Col([
                    html.Div([daq.BooleanSwitch(id='btntoggle_units', on=False, color='#e6e6e6')],
                             style={'width': 'fit-content'})], style={'padding-left': '3%', 'text-align': 'left'},
                        width=5)], style={'margin': 'auto'}),

            dbc.Row([
                    dbc.Col([html.H5("Aggregated Energy", id='lineTitle', style={'margin-left': '5%'})],
                            style={'text-align': 'center'}, width=6),
                    dbc.Col([
                        html.H5("Energy Breakdown Today",
                                id='pieTitle')
                    ], width=3, style={'text-align': 'center'}),
                    ], style={'justify-content': 'center', 'padding-top': '1%', 'margin': 'auto', 'margin-left': '0px'}),
            dbc.Row([
                    dbc.Col([
                        html.Div(dbc.Spinner(color="primary", id="loadingLine",
                                             children=[
                                                 dcc.Graph(id='line-chart', config={'displayModeBar': False}, clear_on_unhover=True, animate=True)],
                                             spinner_style={"width": "3rem", "height": "3rem"}))
                    ], width=6),

                    dbc.Col([
                        html.Div(
                            dbc.Spinner(color="primary", id="loadingPie",
                                        children=[
                                            dcc.Graph(id='pie-chart-2', config={'displayModeBar': False})],
                                        spinner_style={"width": "3rem", "height": "3rem"}))
                    ], width=3, style={'margin-top': '1%'}),
                    ], style={'justify-content': 'center', 'margin': 'auto', 'margin-left': '0px', 'padding-top': '0px'})
        ]),
        dcc.Interval(
            id='interval-component',
            interval=0,  # in milliseconds
            max_intervals=1
        )
    ])

# D) This callback activates upon HOUR DAY WEEK MONTH click as well as individual points


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
# E) Callback Function when Day Hour Month or Week clicked as well as individual points
# @profile
def update_graph_DayMonthYear(btn1_click, btn2_click, btn3_click, btn4_click, btnkwhdollars,
                              clickData, interval,
                              hoverData, btn1, btn2, btn3, btn4):
    global df_hour, df_hour_pie, df_week, df_week_line, df_week_pie, start, end, end_date
    global user1, df3, df4, piechart
    global w, x, y, z
    global fig2
    global values_pie, pie_middletext
    global dayActive, weekActive, monthActive, hourActive
    global df_hour_bytype, df_month_bytype, df_day_bytype, df_week_bytype

    # F) Search for the most recent changed ID to know if hour day week or Month
    # checks the list of id that recently triggered a callback in dash.callback_context.triggered list
    changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]

    if 'hour' in changed_id:

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
        if btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
            df_hour_bytype = hourClickDataPiechart()

            x_value = hoverData['points'][0]['x']

            # Get last 24 hours only

            df_to_process = df_hour_bytype
            try:
                xvalue_tohours = dt.datetime.strptime(
                    x_value, '%I:%M%p').strftime('%H')
                mask = (df_to_process['hours'] == str(xvalue_tohours))
            except ValueError:
                xvalue_tohours = dt.datetime.strptime(
                    x_value, '%I:%M%p').strftime('%H')
                mask = (df_to_process['hours'] == str(xvalue_tohours))

            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]

            df_to_process.reset_index(drop=True, inplace=True)

            df4 = df_to_process
            pie_middletext = x_value

            if btnkwhdollars == False:
                values_pie = df4['power_kWh']

            else:
                values_pie = df4['cost']

        elif btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
            df_month_bytype = monthClickDataPiechart()

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

        elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
            df_week_bytype = weekClickDataPiechart()

            x_value = hoverData['points'][0]['x']
            # Get last 24 hours only
            df_to_process = df_week_bytype
            mask = (df_to_process['week'] == x_value)
            # Delete these row indexes from dataFrame
            df_to_process = df_to_process.loc[mask]

            df_to_process.reset_index(drop=True, inplace=True)
            df4 = df_to_process

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
            df_day_bytype = dayClickDataPiechart()

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
            df_week_bytype = df_week

            # Aggregate df_week_bytype separating type of device

            aggregation_functions = {'power': 'sum', 'month': 'first', 'time': 'first',
                                     'year': 'first', 'power_kWh': 'sum', 'cost': 'sum', 'date': 'first'}  # sum power when combining rows.
            df_week_bytype = df_week_bytype.groupby(
                ['week', 'type'], as_index=False).aggregate(aggregation_functions)
            df_week_bytype.reset_index(drop=True, inplace=True)

            x_value = hoverData['points'][0]['x']
            # Get last 24 hours only

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
    # G) This ELSE will run on First Load of Page

    else:
        if 'btntoggle_units.on' in changed_id:
            pass

        else:
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
        names='type',
        hole=.3,
        values=values_pie,
        color=df4['type'],
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

        if btn4 > btn3 and btn4 > btn2 and btn4 > btn1:
            x = df3['month']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif btn3 > btn4 and btn3 > btn2 and btn3 > btn1:
            x = df3['week']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']
            fig2.update_xaxes(
                tickmode='array',
                ticktext=[
                    "{}".format((start - dt.timedelta(21)).strftime('%d %b')),
                    "{}".format((start - dt.timedelta(14)).strftime(
                        '%d %b')),
                    "{}".format(
                        (start - dt.timedelta(7)).strftime('%d %b')),
                    "{}".format(start.strftime('%d %b')),
                ],


                tickvals=["Week -3", "Week -2", "Week -1", "Week 0"],
            )

        elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
            x = df3['date_withoutYear']
            y = df3['power_kWh']
            values_pie = df4['power_kWh']

        elif btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
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
            # fig2.update_xaxes(
            #     ticktext=["{} - {}".format(start.strftime('%d %b'), end.strftime('%d %b')),
            #               "{} - {}".format((start - dt.timedelta(7)).strftime('%d %b'),
            #                                (end - dt.timedelta(7)).strftime('%d %b')),
            #               "{} - {}".format((start - dt.timedelta(14)).strftime(
            #                   '%d %b'), (end - dt.timedelta(14)).strftime('%d %b')),
            #               "{} - {}".format((start - dt.timedelta(21)).strftime('%d %b'), (end - dt.timedelta(21)).strftime('%d %b'))],
            #     tickvals=["Week 0", "Week -1", "Week -2", "Week -3"],
            # )

            fig2.update_xaxes(
                tickmode='array',
                ticktext=[
                    "{}".format((start - dt.timedelta(21)).strftime('%d %b')),
                    "{}".format((start - dt.timedelta(14)).strftime(
                        '%d %b')),
                    "{}".format(
                        (start - dt.timedelta(7)).strftime('%d %b')),
                    "{}".format(start.strftime('%d %b')),
                ],


                tickvals=["Week -3", "Week -2", "Week -1", "Week 0"],
            )

        # Change to kWh for pie and line graph

        fig2.update_yaxes(ticksuffix=' kWh')

        piechart.update_traces(
            values=values_pie,
            labels=df4['type'],
            textinfo='label+percent',
            hovertemplate="%{label}<br>%{percent}<br>%{value} kWh",

        )
    else:

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
                tickmode='array',
                ticktext=[
                    "{}".format((start - dt.timedelta(21)).strftime('%d %b')),
                    "{}".format((start - dt.timedelta(14)).strftime(
                        '%d %b')),
                    "{}".format(
                        (start - dt.timedelta(7)).strftime('%d %b')),
                    "{}".format(start.strftime('%d %b')),
                ],


                tickvals=["Week -3", "Week -2", "Week -1", "Week 0"],
            )
        elif btn2 > btn4 and btn2 > btn3 and btn2 > btn1:
            x = df3['date_withoutYear']
            y = df3['cost']
            values_pie = df4['cost']

        elif btn1 > btn4 and btn1 > btn3 and btn1 > btn2:
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
            fig2.update_xaxes(
                tickmode='array',
                ticktext=[
                    "{}".format((start - dt.timedelta(21)).strftime('%d %b')),
                    "{}".format((start - dt.timedelta(14)).strftime(
                        '%d %b')),
                    "{}".format(
                        (start - dt.timedelta(7)).strftime('%d %b')),
                    "{}".format(start.strftime('%d %b')),
                ],


                tickvals=["Week -3", "Week -2", "Week -1", "Week 0"],
            )

        # Change to $ for pie and line graph

        fig2.update_yaxes(tickprefix='$ ')
        piechart.update_traces(
            values=values_pie,
            labels=df4['type'],
            textinfo='label+percent',
            hovertemplate="%{label}<br>%{percent}<br>$ %{value}",

        )

        # End of $

    # 3. Final Layout Changes
    fig2.add_trace(go.Scattergl(x=x, y=y,
                                hovertemplate='',
                                line=dict(
                                    color='royalblue',
                                    width=4),
                                selected=dict(
                                    marker=dict(size=30)
                                ),
                                )
                   )

    fig2.add_trace(go.Scattergl(
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
    return fig2, piechart, ("Aggregated {}".format(units), html.Br(), "{}".format(pie_middletext)), ("{} Breakdown".format(units), html.Br(), "{}".format(pie_middletext)), dayActive, weekActive,    monthActive,   hourActive
