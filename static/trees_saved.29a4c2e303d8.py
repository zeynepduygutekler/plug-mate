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
img_style = {'height': '70%', 'width': '70%'}

app = DjangoDash('saved_trees', external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"], serve_locally=True, add_bootstrap_links=True)

app.layout = html.Div([
    dbc.Row([
        dbc.Col(html.Img(id='tree-image', src=static_image_route + 'trees-1.png', style=img_style)),
        dbc.Col(html.Div([
            html.P(id='trees-saved', style={'font-size': '0.9em', 'color': 'green', 'font-weight': 'bold'}),
            html.P(id='energy-saved', style={'font-size': '1.25em', 'color': 'green', 'font-weight': 'bold'})
        ], style={'textAlign': 'center'}))
    ], style={'textAlign': 'center', 'justify-content': 'center'}),

    # This slider is just for us to test by changing the values
    dcc.Slider(id='temp-slider',
               min=0,
               max=30,
               step=2,
               value=0)

], style={'width': '80%', 'display': 'inline-block', 'vertical-align': 'middle'})


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

    return src, f'Total number: {trees_saved} trees', f'{value} kWh'


# @app.server.route('{}<image_path>.png'.format(static_image_route))
def serve_image(image_path):
    image_name = '{}.png'.format(image_path)
    return flask.send_from_directory(image_directory, image_name)

