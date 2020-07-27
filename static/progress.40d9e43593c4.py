import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import plotly.graph_objs as go
import dash_bootstrap_components as dbc
import flask
import os
from django_plotly_dash import DjangoDash

# image_directory = os.getcwd() + '/trees'
# static_image_route = '/static/'
# img_style = {'height': '50%', 'width': '50%'}

app = DjangoDash('progress',
                 external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"],
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
                 html.P('140/1500', style={'font-weight': 'bold', 'marginLeft': 0, 'text-align': 'left', 'padding': 0,
                                           'line-height': '40px',
                                           'height': '40px'}), width=2, style={'padding': 0})
             ], style={'margin': 'auto'}),

    html.Div([
        html.Table(className='table',
                   children=
                   [
                       html.Tr([html.Th('Daily Achievements'), html.Th("Points")],
                               style={'background-color': '#1cc88a', 'color': 'white'})
                   ] + [
                       html.Tr([html.Td('Clock a lower cost savings than yesterday'), html.Td('20 points')]),
                       html.Tr([html.Td('Turn off your plug loads using the remote feature', style={'opacity': 0.3}),
                                html.Td(html.Img(src='https://i.ibb.co/qJqjkk8/trophy.png',
                                                 style={'height': '6%'}))]),
                       html.Tr([html.Td('Turn off your plug loads during lunch'), html.Td(html.P('40 points'))]),
                       html.Tr([html.Td('Complete all daily achievements'), html.Td('100 points')])
                   ] + [
                       html.Tr([html.Th('Weekly Achievements'), html.Th("Points")],
                               style={'background-color': '#4e73df', 'color': 'white'})
                   ] + [
                       html.Tr([html.Td('Clock a lower cost savings  than last week'), html.Td('100 points')]),
                       html.Tr([html.Td("Set next week's schedule-based controls"), html.Td('100 points')]),
                       html.Tr([html.Td("Complete all weekly achievements"), html.Td('300 points')])
                   ] + [
                       html.Tr([html.Th('Bonus Achievements'), html.Th("Points")],
                               style={'background-color': '#6f42c1', 'color': 'white'})
                   ] + [
                       html.Tr([html.Td('Save your first tree', style={'opacity': 0.3}), html.Td(
                           html.Img(src='https://i.ibb.co/qJqjkk8/trophy.png',
                                    style={'height': '6%'}))]),
                       html.Tr([html.Td('Try out our simulation feature'), html.Td('100 points')], ),
                       html.Tr([html.Td('Set your first schedule-based setting', style={'opacity': 0.3}),
                                html.Td(html.Img(src='https://i.ibb.co/qJqjkk8/trophy.png',
                                                 style={'height': '6%'}))]),
                       html.Tr([html.Td('Set your first presence-based setting'), html.Td('100 points')]),
                       html.Tr([html.Td('Complete all achievements'), html.Td('500 points')]),

                   ]
                   )
    ], style={"maxHeight": "19rem", "overflow": "scroll"})

], style={'display': 'inline-block', 'vertical-align': 'middle'})

# app.layout = html.Div([
#     dbc.Row([dbc.Col(html.P('280 more points to Gold. Keep going!',
#                             style={'text-align': 'center', 'font-size': '1.4em', 'font-weight': 'bold',
#                                    'vertical-align': 'middle', 'display': 'flex'}), width=7,style={'padding-left':'50px'}),
#              dbc.Col(html.Img(src="https://i.ibb.co/gj4mK5d/gold.png", style={'height': '20%','width':'40%'}),
#                      style={'line-height': '5'})], style={'align-items':'baseline'}
#             ),
#
#     dbc.Row([dbc.Col(dbc.Progress(children='53%', id='progress-bar', value=320,
#                                   max=600, style={'height': '30px', 'font-size': '15px'}, striped=True, color='warning',
#                                   animated=True), width=10),
#              dbc.Col(
#                  html.P('320/600', style={'font-weight':'bold','marginLeft': 0, 'text-align': 'left', 'padding': 0, 'line-height': '40px',
#                                           'height': '30px'}), width=1, style={'padding': 0})
#              ]),
#     html.Div([
#         html.Table(className='table',
#                    children=
#                    [
#                        html.Tr([html.Th('Daily Achievements'), html.Th("Points")],
#                                style={'background-color': '#1cc88a', 'color': 'white'})
#                    ] + [
#                        html.Tr([html.Td('Clock a lower energy usage than yesterday'), html.Td('100 points')]),
#                        html.Tr([html.Td('Turn off your plug loads using the remote feature', style={'opacity': 0.3}),
#                                 html.Td(html.Img(src='https://image.flaticon.com/icons/svg/3112/3112946.svg',
#                                                  style={'height': '5%'}))]),
#                        html.Tr([html.Td('Set a schedule-based setting'), html.Td('50 points')]),
#                        html.Tr([html.Td('Set a presence-based setting'), html.Td('50 points')])
#                    ] + [
#                        html.Tr([html.Th('Weekly Achievements'), html.Th("Points")],
#                                style={'background-color': '#4e73df', 'color': 'white'})
#                    ] + [
#                        html.Tr([html.Td('Clock a lower energy usage than last week'), html.Td('100 points')]),
#                        html.Tr([html.Td("Set next week's schedule-based controls"), html.Td('50 points')])
#                    ] + [
#                        html.Tr([html.Th('Bonus Achievements'), html.Th("Points")],
#                                style={'background-color': '#6f42c1', 'color': 'white'})
#                    ] + [
#                        html.Tr([html.Td('Save your first tree', style={'opacity': 0.3}), html.Td(
#                            html.Img(src='https://image.flaticon.com/icons/svg/3112/3112946.svg',
#                                     style={'height': '5%'}))]),
#                                            html.Tr([html.Td('Try out our simulation feature'), html.Td('50 points')])
#                                 ]
#
#                    )
#     ], style={"height": "25rem", "overflow": "scroll"})
#
# ], style={'display': 'inline-block', 'vertical-align': 'middle'})













# app.layout = html.Div([
#     html.P('How much would you like to save this week?'),
#     dcc.Slider(id='savings-slider',
#                min=0,
#                max=1,
#                step=0.1,
#                value=0.5,
#                marks={
#                    0.001: {'label': '0%'},
#                    0.2: {'label': '20%'},
#                    0.4: {'label': '40%'},
#                    0.6: {'label': '60%'},
#                    0.8: {'label': '80%'},
#                    1.0: {'label': '100% '},
#                }),
#     dbc.Progress(id='progress-bar',
#                  style={'height':'20px'},
#                  striped=True,
#                  animated=True)],
#     style={'width': '100%', 'display': 'inline-block', 'vertical-align': 'middle'})
#
#
#
# @app.callback(
#     [dash.dependencies.Output('progress-bar', 'value'),
# dash.dependencies.Output('progress-bar', 'children'),
# dash.dependencies.Output('progress-bar', 'max'),
# dash.dependencies.Output('progress-bar', 'color')],
# [dash.dependencies.Input('savings-slider', 'value')]
# )
# def update_progress_bar(savings):
#     average = 45
#     goal = average * (1.0001 - savings)
#     current_value = 10
#     percentage = round((current_value / goal) * 100)
#     if percentage < 70:
#         bar_color = 'success'
#     elif 70 <= percentage < 100:
#         bar_color = 'warning'
#     else:
#         bar_color = 'danger'
#
#     return current_value, f'{current_value}/{round(goal)} kWh ({percentage}%)', goal, bar_color
#
#
# # @app.server.route('{}<image_path>.png'.format(static_image_route))
# def serve_image(image_path):
#     image_name = '{}.png'.format(image_path)
#     return flask.send_from_directory(image_directory, image_name)
#

# if __name__ == '__main__':
#     app.run_server(port=8000, host='127.0.0.1', debug=True)