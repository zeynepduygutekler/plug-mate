import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import plotly.graph_objs as go
import dash_bootstrap_components as dbc
import flask
import os
from django_plotly_dash import DjangoDash

image_directory = os.getcwd() + '/trees'
static_image_route = '/static/'
img_style = {'height': '100%', 'width': '100%'}

app = DjangoDash('progress', external_stylesheets=[dbc.themes.BOOTSTRAP])

app.layout = html.Div([
    html.P('How much would you like to save this week?'),
    dcc.Slider(id='savings-slider',
               min=0,
               max=1,
               step=0.1,
               value=0.5,
               marks={
                   0.001: {'label': '0%'},
                   0.2: {'label': '20%'},
                   0.4: {'label': '40%'},
                   0.6: {'label': '60%'},
                   0.8: {'label': '80%'},
                   1.0: {'label': '100% '},
               }),
    dcc.Graph(id='progress-bar'),
    html.Div(id='placeholder'),
    html.P('Cumulative energy saved'),
    dbc.Row([
        dbc.Col(html.Img(id='tree-image', src=static_image_route + 'trees-1.png', style=img_style), width=2),
        dbc.Col(html.Div([
            html.P(id='trees-saved', style={'font-size': '1.5em', 'color': 'green'}),
            html.P(id='energy-saved', style={'font-size': '2em', 'color': 'green'})
        ], style={'textAlign': 'center'}))
    ]),

    # This slider is just for us to test by changing the values
    dcc.Slider(id='temp-slider',
               min=0,
               max=30,
               step=2,
               value=0)

], style={'width': '49%', 'display': 'inline-block', 'vertical-align': 'middle'})


@app.callback(
    [dash.dependencies.Output('progress-bar', 'figure'),
     dash.dependencies.Output('placeholder', 'children')],
    [dash.dependencies.Input('savings-slider', 'value')]
)
def update_progress_bar(savings):
    last_week = 40
    average = 45
    goal = last_week * savings
    range = [None, average]
    current_value = 10
    percentage = current_value / goal
    if percentage < 0.7:
        bar_color = 'green'
    elif 0.7 <= percentage < 1:
        bar_color = 'orange'
    else:
        bar_color = 'red'

    fig = go.Figure(go.Indicator(
        mode="gauge",
        title={'text': "<b>Energy Usage<br>for this week</b><br><span style='color: gray; font-size:0.8em'>kWh</span>",
               'font': {"size": 14}},
        gauge={'shape': "bullet",
               'borderwidth': 0,
               'axis': {'range': range},
               'threshold': {
                   'line': {'color': "red", 'width': 2},
                   'thickness': 0.75,
                   'value': goal},
               'bar': {'color': bar_color}
               },
        value=current_value,
        domain={'x': [0, 1], 'y': [0, 1]}
    ))

    fig.update_layout(height=220, margin={'l':150, 't':10})

    return fig, ''


@app.callback([dash.dependencies.Output('tree-image', 'src'),
               dash.dependencies.Output('trees-saved', 'children'),
               dash.dependencies.Output('energy-saved', 'children')],
              [dash.dependencies.Input('temp-slider', 'value')])
def update_trees(value):
    '''Conversion: 9 kwh energy saved = 1 tree'''
    rate = 9
    trees_saved = round(value / rate, 1)
    progress_percentage = ((value % rate) / rate) * 100
    if progress_percentage < 20:
        src = '/static/trees-1.png'
    elif progress_percentage < 40:
        src = '/static/trees-2.png'
    elif progress_percentage < 60:
        src = '/static/trees-3.png'
    elif progress_percentage < 80:
        src = '/static/trees-4.png'
    else:
        src = '/static/trees-5.png'

    return src, f'Total number of trees saved: {trees_saved}', f'{value} kWh'


# @app.server.route('{}<image_path>.png'.format(static_image_route))
def serve_image(image_path):
    image_name = '{}.png'.format(image_path)
    return flask.send_from_directory(image_directory, image_name)











# if __name__ == '__main__':
#     app.run_server(port=8000, host='127.0.0.1', debug=True)