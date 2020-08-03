import pandas as pd
import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import dash_bootstrap_components as dbc
from django_plotly_dash import DjangoDash
from functools import lru_cache
import time


def calculate_cost(power):
    '''Convert W into cost'''
    kwh = power / 1000
    singapore_tariff_rate = 0.201
    cost = singapore_tariff_rate * kwh
    return cost


def currency_format(value):
    if value > 0:
        return '${:,.2f}'.format(value)
    else:
        return '-${:,.2f}'.format(abs(value))


def cost_savings(file, frequency):
    '''Takes in the raw data file and converts it into the last 6 week/month worth of aggregated data'''

    df = pd.read_csv(file, parse_dates=['date'])
    df = df.groupby(['date', 'type']).sum().reset_index()
    df = df.pivot(index='date', columns='type', values='power')

    # Converts watts to dollars and finds the difference between each cell and the average
    for col in list(df):
        df[col] = df[col].apply(calculate_cost)
        df[col] = df[col] - df[col].mean()

    # Calculate total
    df['total'] = df.sum(axis=1)

    # Aggregate data based on view & set index
    df = df.groupby(pd.Grouper(freq=frequency)).sum()
    if frequency == 'W-MON':
        df['week'] = df.index
        df['week'] = df['week'].dt.strftime('%-d %b')
        df = df.set_index('week')

    else:
        df['month'] = df.index
        df['month'] = df['month'].dt.strftime('%b')
        df = df.set_index('month')

    # Truncate dataframe
    return df[-7:-1]


# external CSS stylesheets

app = DjangoDash('cost_savings',
                 external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"],
                 add_bootstrap_links=True)

app.layout = html.Div([
    # Toggle button
    html.Link(
        rel='stylesheet',
        href='/static/assets/custom_style.css'
    ),
    dbc.Row([
        dbc.Button('Week', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'}, color="primary",
                   className="mr-1", active=True),
        dbc.Button('Month', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                   color="primary", className="mr-1")
    ], style={'margin': 'auto', 'justify-content': 'center'}),

    # Cost savings graph
    dbc.Spinner(dcc.Graph(id='cost-savings', config={'displayModeBar': False}), color="primary",
                spinner_style={"width": "3rem", "height": "3rem"}),
    dcc.Interval(id='interval-trigger', max_intervals=1, interval=1000),
    html.P(id='placeholder'),

], style={'vertical-align': 'middle'})


@app.callback(
    [dash.dependencies.Output('cost-savings', 'figure'),  # update graph
     dash.dependencies.Output('placeholder', 'children'),
     dash.dependencies.Output('week', 'active'),
     dash.dependencies.Output('month', 'active')],  # update graph
    [dash.dependencies.Input('week', 'n_clicks'),
     dash.dependencies.Input('month', 'n_clicks'),
     dash.dependencies.Input('interval-trigger', 'n_intervals')]
)
def update_bar_chart(n1, n2, int):
    '''This function checks whether user is looking for month/week view, and whether user requires simulation feature
   and outputs a bar graph of the cost savings.
   Variables:
   view - whether user wants 'week' or 'month' view
   df - dataframe with columns of plug loads and values of cost savings
   fig - main graph object
   sim - list of values corresponding to simulation inputs'''

    # Checking buttons for view (week or month), store in var view
    if n1 == n2 == 0: # default
        view = 'Week'
    else:
        changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]
        view = changed_id.split('.')[0].capitalize()  # button's n_clicks acts as state toggle between week and month


    # Process dataframe
    ### SQL code can be inserted here and stored as df
    df = cost_savings('./plug_mate_app/dash_apps/finished_apps/generator_6m.csv',
                      'W-MON') if view == 'Week' else cost_savings(
        './plug_mate_app/dash_apps/finished_apps/generator_6m.csv', 'M')
    series = df['total']
    # Add the text that hovers over each bar for the normal graph
    hovertemplate = '<em>Week of %{x}</em><br>%{hovertext}' if view == 'Week' else '<em>Month of %{x}</em><br>%{hovertext}'

    def create_trace(discount):
        dff = df + abs(df) * discount
        ser = dff['total']
        pos = ser.loc[ser > 0]
        neg = ser.loc[ser < 0]

        hovertext1 = []
        hovertext2 = []
        for date in dff.index:
            string = ''
            for plug_load in list(dff):
                # e.g. <b>Desktop</b>: $3.24<br>
                string = string + '<b>' + plug_load.capitalize() + '</b>' + ': ' + currency_format(
                    dff[plug_load][date]) + '<br>'
            energy_points_earned = round(dff['total'][date]) if dff['total'][date] > 0 else round(
                dff['total'][date] * 0.5)
            string += f'<b>Energy points earned</b>: {energy_points_earned} points'
            if energy_points_earned > 0:
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
        return positive, negative, go.Layout(yaxis=dict(range=[min(ser) - 3, max(ser) * 1.4]))


    def create_frame(discount):
        return go.Frame({'data': create_trace(discount)[:2]}, layout=create_trace(discount)[-1])


    positive_trace, negative_trace = create_trace(0)[:2]
    frame0 = create_frame(0)
    frame1 = create_frame(0.3)
    frame2 = create_frame(0.4)
    frame3 = create_frame(0.5)
    frame4 = create_frame(0.4)
    frame5 = create_frame(0.3)

    fig = go.Figure(data=[positive_trace, negative_trace],
                    layout=go.Layout(
                        go.Layout(
                            yaxis=dict(range=[min(series) - 3, max(series) * 1.4]),
                            annotations=[
                                go.layout.Annotation(
                                    text='<b>Try me</b>',
                                    align='left',
                                    showarrow=False,
                                    xref='paper',
                                    yref='paper',
                                    font=dict(size=13),
                                    x=0.7,
                                    y=1.2,
                                )
                            ]
                        ),
                        updatemenus=[dict(
                            type="dropdown",
                            xanchor='right',
                            x=1,
                            yanchor='bottom',
                            y=1,
                            font=dict(
                                size=12,
                                color="black"),
                            buttons=[dict(label="Current cost savings",
                                          method="animate",
                                          args=[frame0]),
                                     dict(label="Turn off your plug loads during lunch",
                                          method="animate",
                                          args=[frame1]),
                                     dict(label="Turn off your plug loads at the end of the day",
                                          method="animate",
                                          args=[frame2]),
                                     dict(label="Use your monitor on power-saving mode",
                                          method="animate",
                                          args=[frame3]),
                                     dict(label="Use schedule-based controls to manage your devices",
                                          method="animate",
                                          args=[frame4]),
                                     dict(label="Use presence-based control to manage your devices",
                                          method="animate",
                                          args=[frame5])])
                        ]
                    ),
                    )

    # Graph formating
    fig.update_traces(texttemplate='%{y:$.2f}',
                      textposition='auto')
    order = {'categoryarray': df.index.to_list()}
    fig.update_layout(
        hoverlabel={'bgcolor': 'white'},
        xaxis=order,
        yaxis=dict(showgrid=True, zeroline=True),
        font=dict(
            size=12,
            color="black"
        ),
        legend=dict(
            orientation='h',
            yanchor="top",
            y=0.99,
            xanchor="right",
            x=0.99,
            borderwidth=0
        ),
        margin=dict(t=20)
    )
    fig.update_yaxes(tickprefix="$")

    if view == 'Week':
        return fig, '', True, False
    else:
        return fig, '', False, True
