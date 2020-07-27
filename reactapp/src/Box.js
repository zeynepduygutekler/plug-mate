// This is the final component for each plug load, containing the plug load icon and name and the toggle switch

import React from 'react';
import ToggleButton from './ToggleButton';
import './Box.css';
import Icon from './Icon';


class Box extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id.toString() + "Box", // id given to component
      current: this.props.id, // name of plug load
      formatted: "" // initialization of string for formatting of "TaskLamp"
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
      <div class="container" id={this.state.id}>
        <p style={{textAlign: "center", fontFamily: "Helvetica"}}> {this.state.formatted} </p>
        <Icon current={this.state.current} defaultState="ON" />
        <br />
        <ToggleButton id={this.state.current} defaultChecked="true"  />
      </div>
    )
  }
}

export default Box;
