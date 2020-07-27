// This is the component for the plug load icon and name.

import React from 'react';
import './Icon.css';


class Icon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plugLoad: this.props.current, // the current plug load
      defaultState: this.props.defaultState, // the default state (ON or OFF)
      imageSource: "../Images/" + this.props.current.toString() + " " + this.props.defaultState.toString() + ".png", // path to image
      id: this.props.current.toString() + "Icon" // id given to component
    }
  }
  render() {
    // Make some formatting changes when the plug load chosen is task lamp
    if (this.state.plugLoad === "TaskLamp") {
      this.state.imageSource = "../Images/Task Lamp " + this.state.defaultState + ".png"
    }

    return (
      <div id={this.state.id}>
        <div class="green">
          <div class = "white">
            <img src={this.state.imageSource} alt="Icon"/>
          </div>
        </div>
      </div>
    )
  }
}

export default Icon;
