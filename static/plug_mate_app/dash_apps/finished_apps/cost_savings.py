import pandas as pd
import plotly.graph_objects as go
import dash
import dash_html_components as html
import dash_core_components as dcc
import plotly.graph_objs as go
import dash_bootstrap_components as dbc
from django_plotly_dash import DjangoDash



df_week = pd.read_excel('.\\plug_mate_app\\dash_apps\\finished_apps\\test_data.xlsx', sheet_name='bar_week', index_col='week')
df_month = pd.read_excel('.\\plug_mate_app\\dash_apps\\finished_apps\\test_data.xlsx', sheet_name='bar_month', index_col='month')

# external CSS stylesheets
external_stylesheets = [
    dbc.themes.BOOTSTRAP,
]

app = DjangoDash('cost_savings',
                 external_stylesheets=external_stylesheets)

app.layout = html.Div([
    # Toggle button
    html.Button(
        id='week-month-toggle',
        children='View by Week',
        n_clicks=0,
        style={
            'fontFamily': 'sans-serif',
        }
    ),

    # Cost savings graph
    dcc.Graph(id='cost-savings', style={"width": "100%", 'height': '100%'}),

    # Simulation dropdown
    dcc.Dropdown(
        id='sim-input',
        options=[
            {'label': 'turn off your plug loads during lunch', 'value': 0.1},
            {'label': 'turn off your plug loads at the end of the day', 'value': 0.2},
            {'label': 'use your monitor on power-saving mode', 'value': 0.3},
            {'label': 'use our schedule-based controls to manage your plug loads', 'value': 0.04},
            {'label': 'use our presence-based control to manage your plug loads', 'value': 0.06}
        ],
        value=[],
        placeholder='Explore your potential cost savings when you...',
        multi=True,
        style={
            'fontFamily': 'sans-serif',
        }
    )

], style={'width': '100%', 'display': 'inline-block', 'vertical-align': 'middle', })


@app.callback(
    [dash.dependencies.Output('cost-savings', 'figure'),  # update graph
     dash.dependencies.Output('week-month-toggle', 'children')],  # update button text
    [dash.dependencies.Input('week-month-toggle', 'n_clicks'),
     dash.dependencies.Input('sim-input', 'value')]
)
def update_bar_chart(n_clicks, sim):
    '''This function checks whether user is looking for month/week view, and whether user requires simulation feature
    and outputs a bar graph of the cost savings.
    Variables:
    view - whether user wants 'week' or 'month' view
    df - dataframe with columns of plug loads and values of cost savings
    fig - main graph object
    sim - list of values corresponding to simulation inputs'''

    # Calibrating inputs
    view = 'Month' if n_clicks % 2 == 0 else 'Week'  # button's n_clicks acts as state toggle between week and month
    df = df_week if view == 'Week' else df_month
    series = df['total']

    # Adding bar graph colour for positives and negatives
    colour = []
    for data_pt in series.tolist():
        if data_pt > 0:
            colour.append('#06D6A0')  # green
        else:
            colour.append('#EF476F')  # red

    # Add the text that hovers over each bar for the normal graph
    hovertext = []
    for date in df.index:
        string = ''
        for plug_load in list(df):
            # e.g. <b>Desktop</b>: $3.24<br>
            string = string + '<b>' + plug_load.capitalize() + '</b>' + ': $' + str(
                round(df[plug_load][date], 2)) + '<br>'
        hovertext.append(string)

    # Initiate graph object
    fig = go.Figure(data=[go.Bar(x=series.index,
                                 y=series,
                                 text=series,
                                 name='Cost Savings',
                                 hovertemplate='<em>Week of %{x}</em><br>%{hovertext}' if view == 'Week'
                                 else '<em>Month of %{x}</em><br>%{hovertext}',
                                 hovertext=hovertext)
                          ],
                    layout=go.Layout(
                        plot_bgcolor='#ffffff'
                    ))

    # If users opt to view simulation
    if sim:
        difference = abs(series) * sum(sim)
        sim_series = series + difference

        fig.add_trace(go.Bar(x=sim_series.index,
                             y=sim_series,
                             text=sim_series,
                             name='Predicted Cost Savings',
                             hovertemplate='<b>Week of %{x}</b><br>Savings difference: '
                                           '%{hovertext:$.2f}<br>Total Cost Savings: %{y:$.2f}',
                             hovertext=difference.tolist(),
                             opacity=0.6))

    # Graph formating
    fig.update_traces(marker_color=colour,
                      texttemplate='%{y:$.2f}',
                      textposition='auto')
    fig.update_layout(
        # title='Cost savings of plug loads by {}'.format(view),
        hoverlabel={'bgcolor':'white'},
        xaxis_title="Date",
        yaxis_title="Cost savings in Dollars ($)",
    )

    fig.update_yaxes(tickprefix="$", gridcolor='#575353', zerolinecolor='black')
    fig.update_xaxes(showline=True)

    return fig, "View by Month" if view == "Week" else "View by Week"


# # if __name__ == '__main__':
# #     app.run_server(port=8000, host='127.0.0.1', debug=True)

