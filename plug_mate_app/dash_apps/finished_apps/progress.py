import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import pandas as pd
import plotly.graph_objs as go
import dash_bootstrap_components as dbc
import flask
import os
from django.db import connection
from django_plotly_dash import DjangoDash
from datetime import datetime


# image_directory = os.getcwd() + '/trees'
# static_image_route = '/static/'
# img_style = {'height': '50%', 'width': '50%'}

def get_achievements():
    """Reads achievement dataframes from database"""
    reference = pd.read_csv(
        'plug_mate_app/dash_apps/finished_apps/tables_csv/achievements_points.csv')
    reference = reference.set_index('achievement')
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM achievements_daily WHERE user_id=%s", [1])
        results = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
    daily = pd.DataFrame(results, columns=colnames)
    daily.drop(columns=['user_id', 'id'], inplace=True)
    daily = daily.set_index('week_day')
    # #
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM achievements_weekly WHERE user_id=%s", [1])
        results = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
    weekly = pd.DataFrame(results, columns=colnames)
    weekly.drop(columns=['user_id', 'id'], inplace=True)

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM achievements_bonus WHERE user_id=%s", [1])
        results = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
    bonus = pd.DataFrame(results, columns=colnames)
    bonus.drop(columns=['user_id', 'id', 'cum_savings'], inplace=True)

    return daily, weekly, bonus, reference


app = DjangoDash('progress',
                 external_stylesheets=[
                     "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"],
                 serve_locally=True, add_bootstrap_links=True)

app.layout = html.Div([
    # dbc.Row([dbc.Col([html.P('6 daily and 5 weekly achievements left to claim. Keep going!',
    #                          style={'text-align': 'center', 'font-size': '1.3em', 'font-weight': 'bold',
    #                                 'vertical-align': 'middle', 'display': 'table-cell'}),
    #                   # html.P('Keep going!',
    #                   #        style={'text-align': 'center', 'font-size': '1.3em', 'font-weight': 'bold',
    #                   #               'vertical-align': 'middle'}),
    #                   html.Br(),
    #                   html.A("Check your wallet", href='#realtime_card')], width=8,
    #                  style={'padding-left': '50px', 'text-align': 'center'}),
    #          dbc.Col(html.Img(src="https://image.flaticon.com/icons/svg/860/860511.svg", style={'height': '6rem'}),
    #                  style={'margin': 'auto'}, width=4)],
    #         style={'height': '50%', 'align-items': 'baseline', 'margin': 'auto'}
    #         ),

    dbc.Row([dbc.Col(dbc.Progress(children='9%', id='progress-bar', value=140,
                                  max=1500, style={'height': '40px', 'font-size': '15px'}, striped=True,
                                  color='warning',
                                  animated=True), width=10),
             dbc.Col(
                 html.P(id='text', children='140/1500',
                        style={'font-weight': 'bold', 'marginLeft': 0, 'text-align': 'left', 'padding': 0,
                               'line-height': '40px',
                               'height': '40px'}), width=2, style={'padding': 0})
             ], style={'margin': 'auto'}),
    #
    # html.Div(id='HELLO', children=
    # dcc.Tabs(id='tabs', value='daily', style={'width': '20%'}, vertical=False, children=[
    #     dcc.Tab(label='Daily', value='daily'),
    #     dcc.Tab(label='Weekly', value='weekly'),
    #     dcc.Tab(label='Bonus', value='bonus')
    # ]), ),
    html.Div(id='placeholder'),

    html.Div([
        dcc.Interval(id='interval', interval=800000,
                     n_intervals=0, max_intervals=1),
        html.Table(id='achievements', className='table',

                   )
    ], style={'height': '100%'})

], style={'display': 'inline-block', 'vertical-align': 'middle'})


@app.callback(
    [dash.dependencies.Output('achievements', 'children'),
     dash.dependencies.Output('placeholder', 'children')],
    [dash.dependencies.Input('interval', 'n_intervals')]
)
def update_achievements_table(n):
    daily, weekly, bonus, reference = get_achievements()
    today = datetime.today().strftime('%a')
    table = []

    def create_table_row(achievement, points):
        if points > 0:
            return html.Tr([
                html.Td(reference.loc[achievement]
                        ['description'], style={'opacity': 0.3}),
                html.Td(html.Img(src='https://i.ibb.co/qJqjkk8/trophy.png',
                                 style={'height': '6%'}))])
        else:
            return html.Tr([html.Td(reference.loc[achievement]['description']),
                            html.Td(f'{reference.loc[achievement]["points"]}')])

    daily_header = [html.Tr([html.Th('Daily Achievements'), html.Th("Energy Points")],
                            style={'background-color': '#1cc88a', 'color': 'white'})]
    weekly_header = [html.Tr([html.Th('Weekly Achievements'), html.Th("Energy Points")],
                             style={'background-color': '#4e73df', 'color': 'white'})]
    bonus_header = [html.Tr([html.Th('Bonus Achievements'), html.Th("Energy Points")],
                            style={'background-color': '#6f42c1', 'color': 'white'})]
    table += daily_header

    def sort_dict(dictionary):
        return {k: v for k, v in sorted(dictionary.items(), key=lambda item: item[1])}.items()

    for achmt, pts in sort_dict(daily.loc[today].to_dict()):
        table += [create_table_row(achmt, pts)]
    table += weekly_header
    for achmt, pts in sort_dict(weekly.iloc[0].to_dict()):
        table += [create_table_row(achmt, pts)]
    table += bonus_header
    for achmt, pts in sort_dict(bonus.iloc[0].to_dict()):
        # print(achmt, pts)
        table += [create_table_row(achmt, pts)]

    return table, ''


@app.callback(
    [dash.dependencies.Output('progress-bar', 'children'),
     dash.dependencies.Output('progress-bar', 'value'),
     dash.dependencies.Output('progress-bar', 'max'),
     dash.dependencies.Output('text', 'children')],
    [dash.dependencies.Input('interval', 'n_intervals')]
)
def update_progress_bar(n):
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT SUM(lower_energy_con + turn_off_leave + turn_off_end + complete_all_daily) FROM achievements_daily WHERE user_id=%s",
            [1])
        daily_achievements = cursor.fetchone()[0]
        cursor.execute(
            "SELECT SUM(cost_saving + schedule_based + complete_daily + complete_weekly) FROM achievements_weekly WHERE user_id=%s",
            [1])
        weekly_achievements = cursor.fetchone()[0]

    max_weekly_points = 400
    points = daily_achievements + weekly_achievements
    # remaining_points = max_weekly_points - points
    percentage = round((points / max_weekly_points) * 100)

    if percentage < 10:
        return '', points, max_weekly_points, f'{points}/{max_weekly_points}%'
    return percentage, points, max_weekly_points, f'{points}/{max_weekly_points}%'
