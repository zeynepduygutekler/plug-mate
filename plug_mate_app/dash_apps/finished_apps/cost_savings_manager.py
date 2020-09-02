import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import dash_bootstrap_components as dbc
import plotly.io as pio
import pandas as pd
from django_plotly_dash import DjangoDash
from django.db import connection


pio.templates.default = "simple_white"



last_state = ''


app = DjangoDash(name='cost_savings_manager',
                 external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"],
                 add_bootstrap_links=True)


app.layout = html.Div([
    dbc.Row([
        dbc.Col([
            dbc.Row([
                dbc.Button('Week', id='week', n_clicks=0, n_clicks_timestamp=0, color="primary",
                   className="mr-1", active=True),
                dbc.Button('Month', id='month', n_clicks=0, n_clicks_timestamp=0,
                   color="primary", className="mr-1"),
                dbc.Button('Year', id='year', n_clicks=0, n_clicks_timestamp=0,
                   color="primary", className="mr-1")
    ], style={'margin': 'auto', 'justify-content': 'center'}),

    # Cost savings graph
    dbc.Spinner(dcc.Graph(id='cost-savings', config={'displayModeBar': False}), color="primary",
                spinner_style={"width": "3rem", "height": "3rem"}),
    dcc.Interval(id='interval-trigger', max_intervals=1, interval=1000),
    html.P(id='placeholder'),

    ]),
    # Toggle button
    dbc.Col([
        dbc.Row([
            dbc.Col([
                html.H4('Strategies', style={'padding-top':'10px'}),
                dcc.Checklist(
                options=[
                    {'label': 'Implement plug-mate to an additional office level in the building', 'value': 1200},
                    {'label': 'Increase the adoption of presence-based controls by 15%', 'value': 1000},
                    {'label': 'Remind building occupants to switch off their plug loads at the end of the day and over the weekends', 'value': 800},
                    {'label': 'Upgrade existing monitors to more energy-efficient models that bear the “Energy Label"', 'value': 600},
                    {'label': 'Increase the variety of redeemable rewards in the rewards page to increase user engagement rate by 20% ', 'value': 500}
            ],
            className='cschecklist',
            inputClassName='cscheckbox',
            labelClassName='cslabel',
            value=[1200],
            style={'display':'grid', 'grid-auto-rows':'90px'},
            id='checklist'
            )

            ], width=8),
            dbc.Col([
            html.H4('Estimated Cost', style={'padding-top':'10px'}),
            html.Div([
                html.P('$1,200 - $1,500 / month'),
                html.P('$1,000 / month'),
                html.P('$800 - $1,000 / month'),
                html.P('$600 - $800 / month'),
                html.P('$500 - $800 / month'),
            ], style={'display':'grid','grid-auto-rows':'90px'})
            
            ])
            
        ]),



    ])
    ])
  

], style={'width': '100%', 'display': 'inline-block', 'vertical-align': 'middle'})


@app.callback(
    [dash.dependencies.Output('cost-savings', 'figure'),  # update graph
     dash.dependencies.Output('placeholder', 'children'),
     dash.dependencies.Output('week', 'active'),
     dash.dependencies.Output('month', 'active'),
     dash.dependencies.Output('year', 'active')],  # update graph
    [dash.dependencies.Input('week', 'n_clicks'),
     dash.dependencies.Input('month', 'n_clicks'),
     dash.dependencies.Input('year', 'n_clicks'),
     dash.dependencies.Input('interval-trigger', 'n_intervals'),
     dash.dependencies.Input('checklist', 'value'),]
)
def update_bar_chart(n1, n2,n3, int, ls):
    '''This function checks whether user is looking for month/week view, and whether user requires simulation feature
   and outputs a bar graph of the cost savings.
   Variables:
   view - whether user wants 'week' or 'month' view
   df - dataframe with columns of plug loads and values of cost savings
   fig - main graph object
   sim - list of values corresponding to simulation inputs'''

    # Determine the default week
    global last_state
    monthly_increase = sum(ls)
    yearly_increase = monthly_increase*12
    weekly_increase = monthly_increase/4
    changed_id = [p['prop_id'] for p in dash.callback_context.triggered][
        0]  # Checking which button was the last pressed
    view = changed_id.split('.')[0].capitalize()  # button's n_clicks acts as state toggle between week and month
    if (n1 == 0 and n2 == 0):  # default
        view = 'Week'
    if view == 'Checklist':
        view = last_state
    
    if view == 'Week':
        increase = weekly_increase
    elif view == 'Month':
        increase = monthly_increase
    else:
        increase = yearly_increase
    
    df = pd.read_csv(f'manager_costsavings_{view.lower()}.csv')
    df.index = df.time

    series = df['cost_savings'] + increase
    series.index = df.index

    def currency_format(value):
        if value > 0:
            return '${:,.2f}'.format(value)
        else:
            return '-${:,.2f}'.format(abs(value))

    # Add the text that hovers over each bar for the normal graph

    hovertemplate = f'<em>{view} of %{{x}}</em><br>%{{hovertext}}'

    def create_trace(discount):
        ser = series
        ser.replace(0, 0.001, inplace=True)
        pos = ser.loc[ser >= 0]
        neg = ser.loc[ser < 0]

        hovertext1 = []
        hovertext2 = []

        for time in ser.index:
            string = ''
            rooms = {'Room 1':0.5, 'Room 2':0.3,'Room 3':0.2}
            for room in ['Room 1', 'Room 2', 'Room 3']:
                value = rooms[room] * ser[time]
                string = string + '<b>' + room.capitalize() + '</b>: ' + currency_format(
                        value) + '<br>'
            
            string = string + '<b>' + 'Total' + '</b>' + ': ' + currency_format(
                ser[time]) + '<br>'
            if ser[time] >= 0:
                hovertext1.append(string)
            else:
                hovertext2.append(string)


        positive = go.Bar(x=pos.index,
                          y=pos,
                          text=series,
                          name='Positive Cost Savings',
                          hoverinfo='x+y+text',
                          hovertemplate=hovertemplate,
                          hovertext=hovertext1,
                          hoverlabel=dict(namelength=0),
                          marker_color='#06D6A0',
                          showlegend=True,
                          )
        negative = go.Bar(x=neg.index,
                          y=neg,
                          text=series,
                          name='Negative Cost Savings',
                          hoverinfo='x+y+text',
                          hovertemplate=hovertemplate,
                          hovertext=hovertext2,
                          hoverlabel=dict(namelength=0),
                          marker_color='#EF476F',
                          showlegend=True,
                          )
        if min(ser) > 0:
            layout = go.Layout(yaxis=dict(range=[0, max(ser) * 1.4]))
        else:
            layout = go.Layout(yaxis=dict(range=[min(ser) * 1.4, max(ser) * 1.4]))
        return positive, negative, layout

    # def create_frame(discount):
    #     return go.Frame({'data': create_trace(discount)[:2]}, layout=create_trace(discount)[-1])

    positive_trace, negative_trace = create_trace(increase)[:2]


    if min(series) > 0:
        range = [0, max(series) * 1.4]
    else:
        range = [min(series) * 1.4, max(series) * 1.4]

    fig = go.Figure(data=[positive_trace, negative_trace],
                    layout=go.Layout(
                        go.Layout(
                            yaxis=dict(range=range),
                        ),
                    ),
                )

    # Graph formating
    fig.update_traces(texttemplate='%{y:$.2f}',
                      textposition='auto')
    def f7(seq):
        seen = set()
        seen_add = seen.add
        return [x for x in seq if not (x in seen or seen_add(x))]
    order = {'categoryarray': f7(df.index.to_list())}
    fig.update_layout(
        hoverlabel={'bgcolor': 'white'},
        xaxis=order,
        yaxis=dict(showgrid=True, zeroline=True),
        font=dict(
            size=12,
            color="black"
        ),
        height=400,
        legend=dict(
            orientation='h',
            yanchor="top",
            y=0.99,
            xanchor="right",
            x=0.99,
            borderwidth=0
        ),
        margin=dict(t=10, b=0)
    )
    fig.update_yaxes(tickprefix="$")
    last_state = view

    if view == 'Week':
        return fig, '', True, False, False
    else:
        return fig, '', False, True, False

