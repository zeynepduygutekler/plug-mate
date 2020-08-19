import dash
import dash_html_components as html
import dash_core_components as dcc
import dash_bootstrap_components as dbc
from django_plotly_dash import DjangoDash

app = DjangoDash('tips',
                 external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"],
                 serve_locally=True, add_bootstrap_links=True)

app.layout = html.Div([
    dcc.Interval(id='interval', interval=8000),
    html.Div([
        dbc.Row([
            html.Button(id='previous-tip',
                        children=[html.Img(src='https://image.flaticon.com/icons/svg/566/566011.svg',
                                           style={'width': '60%', 'height': 'auto'})],
                        style={'border': 'none', 'background-color': 'transparent', 'outline': 'none','opacity':'0.4',
                               'text-align':'left', 'padding-left':'20px'}),
            html.Div(className='col-6'),
            html.Button(id='next-tip',
                        children=[html.Img(src='https://image.flaticon.com/icons/svg/566/566012.svg',
                                           style={'width': '60%', 'height': 'auto'})],
                        style={'border': 'none', 'background-color': 'transparent', 'outline': 'none', 'opacity':'0.4',
                               'text-align':'right', 'padding-right':'20px'})
        ], style={'flex-wrap': 'nowrap', 'height': '3rem', 'margin':0}),

    ], style={'text-align': 'right'}),
    html.Div([html.P(id='carousel',
                     style={
                         'font-weight': '500',
                         'font-size': 'medium',
                         'color': '#5a5c69',
                         'font-family': 'Nunito,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoj'
                     }

                     ),
              html.A(id='anchor',
                     style={
                         'font-weight': 'bold',
                         'font-size': 'medium',
                         'font-family': 'Nunito,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoj;'
                     }
                     )]),

])
num = 0
@app.callback(
    [dash.dependencies.Output('carousel', 'children'),
     dash.dependencies.Output('anchor', 'children'),
     dash.dependencies.Output('anchor', 'href')],
    [dash.dependencies.Input('interval', 'n_intervals'),
     dash.dependencies.Input('next-tip','n_clicks'),
     dash.dependencies.Input('previous-tip','n_clicks')]
)
def update_carousel(a,b,c):
    global num
    try:
        changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]
    except:
        return "Remember to switch off your plug loads when you are leaving for long meetings", '',''
    tips = {
        "Remember to switch off your plug loads when you are leaving for long meetings": '',
        'Remember to switch off your plug loads when you are leaving at the end of the day': '',
        'Remember to switch off your plug loads when you are leaving for your lunch breaks': '',
        'Do you know that you can use our system to remotely switch ON and OFF your plug loads using our system?': '#',
        'Do you know that our system is able to detect that you have arrived at your desk and switch ON your plug loads accordingly?': '#',
        'Do you know that our system is able to detect that you have left your desk and switch OFF your plug loads accordingly?': '#',
        'Do you know that you can schedule your plug loads to be switched ON and OFF at your desired timings throughout the day using our system?': '#',
        'You can redeem your energy points for rewards such as food vouchers!': 'www.fb.com',
        'For every dollar of cost you\'ve saved, you earn 10 energy points': '',
        'You can earn energy points even quicker just by accomplishing tasks': '#',
    }
    if changed_id == "previous-tip":
        display_tip = list(tips)[num]
        num = num - 1 if num > 0 else len(tips) - 1
    else:
        display_tip = list(tips)[num]
        num = num + 1 if num + 1 < len(tips) else 0

    href = tips[display_tip]
    anchor_children = 'Check out this feature here!' if href else ''
    return display_tip, anchor_children, href

