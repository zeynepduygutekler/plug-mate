// Component for the dropdown

import React from "react";

class PresenceDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: this.props.current, // the plug load that the dropdown is for
      selected: "", // selected value
      disabled: this.props.disabled, // disable dropdown (true or false)
      id: this.props.current + "select" // id given to component
    };
    window.dropdown = this; // make sure that dropdown can be accessed globally
  }
  render() {
    var formattedtext = this.state.current;
    if (formattedtext === "TaskLamp") {
      formattedtext = "Task Lamp";
    }
    return (
      <>
        <div style={{display:"inline-block"}} className="wordPresence">
            <p style={{fontWeight:"bold", fontSize:"1rem", marginLeft:"20px"}}> {formattedtext} </p>
        </div>
        <select
            style={{marginLeft:"20px"}}
          defaultValue={this.state.selected}
          name={this.state.current}
          id={this.state.id}
          onChange={e =>
            this.setState({
              selected: e.target.value
            })
          }
          disabled={this.state.disabled}
        >
          <option value="off"> OFF </option>
          <optgroup label="Off after I leave for:">
          <option value="5 minutes"> 5 minutes </option>
          <option value="10 minutes"> 10 minutes </option>
          <option value="20 minutes"> 20 minutes </option>
          <option value="30 minutes"> 30 minutes </option>
          <option value="60 minutes"> 1 hour </option>
          <option value="other"> Other </option>
          </optgroup>

        </select>
      </>
    );
  }
}

export default PresenceDropdown;
