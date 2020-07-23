import dash
import dash_html_components as html
import dash_core_components as dcc
import dash_bootstrap_components as dbc
from random import choice
from django_plotly_dash import DjangoDash

app = DjangoDash('tips', external_stylesheets=[dbc.themes.BOOTSTRAP])

app.layout = html.Div([
    dcc.Interval(id='interval', interval=5000),
    html.Div([html.P(id='carousel',
                     style={
                         'fontFamily': 'Atma',
                     }
                     ),
              html.A(id='anchor',
                     style={
                         'fontFamily': 'Atma',
                     }
                     )])
])


@app.callback(
    [dash.dependencies.Output('carousel', 'children'),
     dash.dependencies.Output('anchor', 'children'),
     dash.dependencies.Output('anchor', 'href')],
    [dash.dependencies.Input('interval', 'n_intervals')]
)
def update_carousel(n):
    tips = {
        "Remember to switch off your plug loads when you are leaving for long meetings": '',
        'Remember to switch off your plug loads when you are leaving at the end of the day': '',
        'Remember to switch off your plug loads when you are leaving for your lunch breaks': '',
        'Do you know that you can use our system to remotely switch ON and OFF your plug loads using our system?': '#',
        'Do you know that our system is able to detect that you have arrived at your desk and switch ON your plug loads accordingly?': '#',
        'Do you know that our system is able to detect that you have left your desk and switch OFF your plug loads accordingly?': '#',
        'Do you know that you can schedule your plug loads to be switched ON and OFF at your desired timings throughout the day using our system?': '#'
    }
    display_tip = choice(list(tips))
    href = tips[display_tip]
    anchor_children = 'Check out this feature here!' if href else ''
    return display_tip, anchor_children, href


# if __name__ == '__main__':
#     app.run_server(port=8000, host='127.0.0.1', debug=True)
