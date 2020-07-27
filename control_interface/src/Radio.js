// This is the component to select the repeat options.

import React from "react";

class Radio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      default: this.props.default // This is the default value that should be checked, depending on the repeat options that has been set.
    }
  }
  render() {
    return (
      <>
          <h3 style={{fontSize:"12px"}}> {this.props.name} </h3>
          {this.state.default === "Every Day" && <input type="radio" name={this.props.name} value="Every Day" defaultChecked/>}
          {this.state.default !== "Every Day" && <input type="radio" name={this.props.name} value="Every Day"/>}
          <label style={{marginLeft:"10px"}}> Every Day </label>
          <br />
          {this.state.default === "Every Week" && <input type="radio" name={this.props.name} value="Every Week" defaultChecked/>}
          {this.state.default !== "Every Week" && <input type="radio" name={this.props.name} value="Every Week"/>}
          <label style={{marginLeft:"10px"}}> Every {this.props.day} </label>
      </>
    );
  }
}

export default Radio;
