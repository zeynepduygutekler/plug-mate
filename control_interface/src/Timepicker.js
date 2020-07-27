// This is the component to select the start and end times in the popup.

import React from "react";
import "rc-time-picker/assets/index.css";
import TimePicker from "rc-time-picker";

class Timepicker extends React.Component {
  state = {
    startValue: this.props.defaultStart, // This is the default value for the start time when popup appears.
    endValue: this.props.defaultEnd // This is the default value for the end time when popup appears.
  };

  // When the start value is changed, update the state.
  handleStartValueChange = (startValue, endValue) => {
    this.setState({startValue})
  };

  // When the end value is changed, update the state.
  handleEndValueChange = (startValue, endValue) => {
    this.setState({endValue})
  };

  render() {
    const { startValue, endValue } = this.state;
    return (
      <div>
        <h3 style={{fontSize:"12px"}}> Start: </h3>
        <TimePicker
          id="start"
          showSecond={false}
          defaultValue={startValue}
          onChange={this.handleStartValueChange}
          format={"h:mm A"}
          minuteStep={15}
          use12Hours
          className="xxx"
        />
        <h3 style={{fontSize:"12px"}}> End: </h3>
        <TimePicker
          id="end"
          showSecond={false}
          defaultValue={endValue}
          onChange={this.handleEndValueChange}
          format={"h:mm A"}
          minuteStep={15}
          use12Hours
          className="xxx"
        />
      </div>
    );
  }
}

export default Timepicker;
