// This is the final component for each plug load, containing the plug load icon and name and the toggle switch

import React from 'react';
import RemoteToggleButton from './RemoteToggleButton';
import './RemoteBox.css';
import RemoteIcon from './RemoteIcon';


class RemoteBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id.toString() + "BoxRemote", // id given to component
      current: this.props.id, // name of plug load
      formatted: "", // initialization of string for formatting of "TaskLamp"
      toggleButtonId: this.props.id.toString() + "ToggleRemote"
    }
  }
  render() {
    // Make some formatting changes when the plug load chosen is task lamp
    if (this.state.current === "TaskLamp") {
      this.state.formatted = "Task Lamp"
    } else {
      this.state.formatted = this.state.current
    }

    return(
      <div class="containerRemote" id={this.state.id}>
        <p style={{textAlign: "center", fontWeight:"bold"}}> {this.state.formatted} </p>
        <RemoteIcon current={this.state.current} defaultState="ON" />
        <br />
        <RemoteToggleButton id={this.state.toggleButtonId} defaultChecked="true"  />
      </div>
    )
  }
}

export default RemoteBox;
