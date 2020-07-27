// This is the component for the "Also apply to: " option

import React from "react";

class Checkbox extends React.Component {
  render() {
    // Set the option id based on the plug load options
    var option1id = "";
    var option2id = "";
    var option3id = "";
    var option4id = "";
    if (this.props.option1 === "Desktop") {option1id = "r1"}
    if (this.props.option1 === "Monitor") {option1id = "r2"}
    if (this.props.option1 === "Laptop") {option1id = "r3"}
    if (this.props.option1 === "Task Lamp") {option1id = "r4"}
    if (this.props.option1 === "Fan") {option1id = "r5"}
    if (this.props.option2 === "Desktop") {option2id = "r1"}
    if (this.props.option2 === "Monitor") {option2id = "r2"}
    if (this.props.option2 === "Laptop") {option2id = "r3"}
    if (this.props.option2 === "Task Lamp") {option2id = "r4"}
    if (this.props.option2 === "Fan") {option2id = "r5"}
    if (this.props.option3 === "Desktop") {option3id = "r1"}
    if (this.props.option3 === "Monitor") {option3id = "r2"}
    if (this.props.option3 === "Laptop") {option3id = "r3"}
    if (this.props.option3 === "Task Lamp") {option3id = "r4"}
    if (this.props.option3 === "Fan") {option3id = "r5"}
    if (this.props.option4 === "Desktop") {option4id = "r1"}
    if (this.props.option4 === "Monitor") {option4id = "r2"}
    if (this.props.option4 === "Laptop") {option4id = "r3"}
    if (this.props.option4 === "Task Lamp") {option4id = "r4"}
    if (this.props.option4 === "Fan") {option4id = "r5"}

    return (
      <>
        <h3 style={{fontSize:"12px"}}> Also apply to: </h3>
        <input
          type="checkbox"
          name={this.props.name}
          value={option1id}
        />
        <label style={{marginLeft:"10px"}} htmlFor={this.props.option1}> {this.props.option1} </label>
        <br />
        <input
          type="checkbox"
          name={this.props.name}
          value={option2id}
        />
        <label style={{marginLeft:"10px"}} htmlFor={this.props.option2}> {this.props.option2} </label>
        <br />
        <input
          type="checkbox"
          name={this.props.name}
          value={option3id}
        />
        <label style={{marginLeft:"10px"}} htmlFor={this.props.option3}> {this.props.option3} </label>
        <br />
        <input
          type="checkbox"
          name={this.props.name}
          value={option4id}
        />
        <label style={{marginLeft:"10px"}} htmlFor={this.props.option4}> {this.props.option4} </label>
      </>
    );
  }
}

export default Checkbox;
