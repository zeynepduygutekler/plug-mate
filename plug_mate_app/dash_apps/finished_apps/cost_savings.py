import pandas as pd
import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import plotly.graph_objs as go
import dash_bootstrap_components as dbc
from django_plotly_dash import DjangoDash


def calculate_cost(power):
    '''Convert W into cost'''
    kwh = power / 1000
    singapore_tariff_rate = 0.201
    cost = singapore_tariff_rate * kwh
    return cost


def cost_savings(file, frequency):
    '''Takes in the raw data file and converts it into the last 6 week/month worth of aggregated data'''
    df = pd.read_csv(file, parse_dates=['date'])
    df = df.groupby(['date', 'type']).sum().reset_index()
    df = df.pivot(index='date', columns='type', values='power')
    for col in list(df):
        df[col] = df[col].apply(calculate_cost)
        df[col] = df[col] - df[col].mean()
    df['total'] = df.sum(axis=1)

    df = df.groupby(pd.Grouper(freq=frequency)).sum()
    if frequency == 'W-MON':
        df['week'] = df.index
        df['week'] = df['week'].dt.strftime('%-d %b')
        df = df.set_index('week')

    else:
        df['month'] = df.index
        df['month'] = df['month'].dt.strftime('%b')
        df = df.set_index('month')

    return df[-7:-1]

# df_week = pd.read_excel('.\\plug_mate_app\\dash_apps\\finished_apps\\test_data.xlsx', sheet_name='bar_week', index_col='week')
# df_month = pd.read_excel('.\\plug_mate_app\\dash_apps\\finished_apps\\test_data.xlsx', sheet_name='bar_month', index_col='month')

df_week = cost_savings('.\\plug_mate_app\\dash_apps\\finished_apps\\generator_6m.csv', 'W-MON')
df_month = cost_savings('.\\plug_mate_app\\dash_apps\\finished_apps\\generator_6m.csv', 'M')


# external CSS stylesheets

app = DjangoDash('cost_savings',
                 external_stylesheets=["https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"], serve_locally=True, add_bootstrap_links=True)


app.layout = html.Div([
    # Toggle button
    dbc.Row([
        dbc.Button('Week', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'}, color="primary",
                   className="mr-1"),
        dbc.Button('Month', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
                   color="primary", className="mr-1")
    ], style={'padding-top': '3%', 'margin': 'auto', 'justify-content': 'center'}),
    html.P(id='placeholder'),

    # Cost savings graph
    dbc.Spinner(dcc.Graph(id='cost-savings', config={'displayModeBar': False}), color="primary",
                spinner_style={"width": "3rem", "height": "3rem"}),
    dcc.Interval(id='interval-trigger', max_intervals=1, interval=1000),

], style={'width': '50%', 'display': 'inline-block', 'vertical-align': 'middle'})


@app.callback(
    [dash.dependencies.Output('cost-savings', 'figure'),  # update graph
     dash.dependencies.Output('placeholder', 'children')],  # update button text
    [dash.dependencies.Input('week', 'n_clicks'),
     dash.dependencies.Input('month', 'n_clicks'),
     dash.dependencies.Input('interval-trigger','n_intervals')]
)
def update_bar_chart(n1, n2, interval):
    '''This function checks whether user is looking for month/week view, and whether user requires simulation feature
    and outputs a bar graph of the cost savings.
    Variables:
    view - whether user wants 'week' or 'month' view
    df - dataframe with columns of plug loads and values of cost savings
    fig - main graph object
    sim - list of values corresponding to simulation inputs'''

    # Calibrating inputs
    changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]
    view = changed_id.split('.')[0].capitalize()  # button's n_clicks acts as state toggle between week and month
    if n1 == 0 and n2 == 0:  # default
        view = 'Week'
    df = df_week if view == 'Week' else df_month
    series = df['total']

    def currency_format(value):
        if value > 0:
            return '${:,.2f}'.format(value)
        else:
            return '-${:,.2f}'.format(abs(value))

    # Add the text that hovers over each bar for the normal graph

    hovertemplate = '<em>Week of %{x}</em><br>%{hovertext}' if view == 'Week' else '<em>Month of %{x}</em><br>%{hovertext}'

    def create_trace(discount):
        dff = df + abs(df) * discount
        ser = dff['total']
        pos = ser.loc[ser > 0]
        neg = ser.loc[ser < 0]

        hovertext = []
        for date in dff.index:
            string = ''
            for plug_load in list(dff):
                # e.g. <b>Desktop</b>: $3.24<br>
                string = string + '<b>' + plug_load.capitalize() + '</b>' + ': ' + currency_format(
                    dff[plug_load][date]) + '<br>'
            energy_points_earned = round(dff['total'][date]) if dff['total'][date] > 0 else round(dff['total'][date] * 0.5)
            string += f'<b>Energy points earned</b>: {energy_points_earned} points'
            hovertext.append(string)

        positive = go.Bar(x=pos.index,
                          y=pos,
                          text=series,
                          name='Positive Cost Savings',
                          hoverinfo='x+y+text',
                          hovertemplate=hovertemplate,
                          hovertext=hovertext,
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
                          hovertext=hovertext,
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
                                family="sans-serif",
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
        title='Cost savings of plug loads by {}'.format(view),
        hoverlabel={'bgcolor': 'white'},
        xaxis_title="Time",
        xaxis=order,
        yaxis_title="Cost savings in Dollars ($)",
        yaxis=dict(showgrid=True, zeroline=True),
        font=dict(
            family="sans-serif",
            size=12,
            color="black"
        ),
        legend=dict(
            orientation='h',
            yanchor="top",
            y=0.99,
            xanchor="right",
            x=0.99,
            bordercolor="Black",
            borderwidth=2
        )
    )
    fig.update_yaxes(tickprefix="$")

    return fig, ''

# app.layout = \
#     html.Div([
#         # Toggle button
#         dbc.Row([
#             dbc.Button('Week', id='week', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'}, color="primary",
#                        className="mr-1"),
#             dbc.Button('Month', id='month', n_clicks=0, n_clicks_timestamp=0, style={'width': '100px'},
#                        color="primary", className="mr-1")
#         ], style={'padding-top': '3%', 'margin': 'auto', 'justify-content': 'center'}),
#
#
#
#         # Cost savings graph
#         dcc.Graph(id='cost-savings', style={"width": "100%", 'height': '70%'}),
#         html.P(id='placeholder'),
#
#         # Simulation dropdown
#         dcc.Dropdown(
#             id='sim-input',
#             options=[
#                 {'label': 'turn off your plug loads during lunch', 'value': 0.1},
#                 {'label': 'turn off your plug loads at the end of the day', 'value': 0.2},
#                 {'label': 'use your monitor on power-saving mode', 'value': 0.3},
#                 {'label': 'use our schedule-based controls to manage your plug loads', 'value': 0.04},
#                 {'label': 'use our presence-based control to manage your plug loads', 'value': 0.06}
#             ],
#             value=[],
#             placeholder='Explore your potential cost savings when you...',
#             multi=True,
#             style={
#                 'fontFamily': 'sans-serif',
#             }
#         ),
#         dcc.Interval(
#             id='interval-component',
#             interval=0,  # in milliseconds
#             max_intervals=1
#         )
#
#     ], style={'width': '100%', 'display': 'inline-block', 'vertical-align': 'middle', }
# )
#
#
# @app.callback(
#     [dash.dependencies.Output('cost-savings', 'figure'),  # update graph
#      dash.dependencies.Output('placeholder', 'children')],  # update button text
#     [dash.dependencies.Input('week', 'n_clicks'),
#      dash.dependencies.Input('month', 'n_clicks'),
#      dash.dependencies.Input('sim-input', 'value'),
#      dash.dependencies.Input('interval-component', 'n_intervals')]
#
#     # [dash.dependencies.Output('cost-savings', 'figure'),  # update graph
#     #  dash.dependencies.Output('placeholder', 'children')],  # update button text
#     # [dash.dependencies.Input('week-month-toggle', 'n_clicks'),
#     #  dash.dependencies.Input('sim-input', 'value')]
# )
# def update_bar_chart(n1,n2, sim, interval):
#     '''This function checks whether user is looking for month/week view, and whether user requires simulation feature
#     and outputs a bar graph of the cost savings.
#     Variables:
#     view - whether user wants 'week' or 'month' view
#     df - dataframe with columns of plug loads and values of cost savings
#     fig - main graph object
#     sim - list of values corresponding to simulation inputs'''
#
#     # Calibrating inputs
#     changed_id = [p['prop_id'] for p in dash.callback_context.triggered][0]
#     view = changed_id.split('.')[0].capitalize()  # button's n_clicks acts as state toggle between week and month
#     df = df_week if view == 'Week' else df_month
#     series = df['total']
#
#     # view = 'Month' if n_clicks % 2 == 0 else 'Week'  # button's n_clicks acts as state toggle between week and month
#     # df = df_week if view == 'Week' else df_month
#     # series = df['total']
#
#     # Adding bar graph colour for positives and negatives
#     colour = []
#     for data_pt in series.tolist():
#         if data_pt > 0:
#             colour.append('#06D6A0')  # green
#         else:
#             colour.append('#EF476F')  # red
#
#     # Add the text that hovers over each bar for the normal graph
#     hovertext = []
#     for date in df.index:
#         string = ''
#         for plug_load in list(df):
#             # e.g. <b>Desktop</b>: $3.24<br>
#             string = string + '<b>' + plug_load.capitalize() + '</b>' + ': $' + str(
#                 round(df[plug_load][date], 2)) + '<br>'
#         hovertext.append(string)
#
#     # Initiate graph object
#
#     fig = go.Figure(data=[go.Bar(x=series.index,
#                                  y=series,
#                                  text=series,
#                                  name='Cost Savings',
#                                  hovertemplate='<em>Week of %{x}</em><br>%{hovertext}' if view == 'Week'
#                                  else '<em>Month of %{x}</em><br>%{hovertext}',
#                                  hovertext=hovertext)
#                           ])
#
#
#
#     # fig = go.Figure(data=[go.Bar(x=series.index,
#     #                              y=series,
#     #                              text=series,
#     #                              name='Cost Savings',
#     #                              hovertemplate='<em>Week of %{x}</em><br>%{hovertext}' if view == 'Week'
#     #                              else '<em>Month of %{x}</em><br>%{hovertext}',
#     #                              hovertext=hovertext)
#     #                       ],
#     #                 layout=go.Layout(
#     #                     plot_bgcolor='#ffffff'
#     #                 ))
#
#     # If users opt to view simulation
#     if sim:
#         difference = abs(series) * sum(sim)
#         sim_series = series + difference
#
#         fig.add_trace(go.Bar(x=sim_series.index,
#                              y=sim_series,
#                              text=sim_series,
#                              name='Predicted Cost Savings',
#                              hovertemplate='<b>Week of %{x}</b><br>Savings difference: '
#                                            '%{hovertext:$.2f}<br>Total Cost Savings: %{y:$.2f}',
#                              hovertext=difference.tolist(),
#                              opacity=0.6))
#
#     # Graph formating
#     fig.update_traces(marker_color=colour,
#                       texttemplate='%{y:$.2f}',
#                       textposition='auto')
#     fig.update_layout(
#         # title='Cost savings of plug loads by {}'.format(view),
#         hoverlabel={'bgcolor':'white'},
#         # xaxis_title="Date",
#         # yaxis_title="Cost savings in Dollars ($)",
#         yaxis=dict(showgrid=True, zeroline=True),
#         font=dict(
#             # family="sans-serif",
#             size=12,
#             color="black"
#     ), margin=dict(t=50)
#     )
#
#     fig.update_yaxes(tickprefix="$", showgrid=True, zerolinecolor='black')
#     fig.update_xaxes(showline=True)
#
#     return fig, ''

#This goes next to return:  "View by Month" if view == "Week" else "View by Week"


# # if __name__ == '__main__':
# #     app.run_server(port=8000, host='127.0.0.1', debug=True)

