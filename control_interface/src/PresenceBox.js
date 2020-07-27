// Final component, containing icon, name, and dropdown

import React from "react";
import PresenceIcon from "./PresenceIcon";
import PresenceDropdown from "./PresenceDropdown";
import "./PresenceBox.css";

class PresenceBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plugload: this.props.plugload // current plug load
    };
  }
  render() {
    var id_name = this.state.plugload.toString() + "dropdown"; // give the component an id
    return (
      <div className="containerPresence">
        <div className="iconPresence">
          <PresenceIcon plugload={this.state.plugload} />
        </div>
        <div className="dropdownPresence" id={id_name}>
          <PresenceDropdown current={this.state.plugload} />
        </div>
      </div>
    );
  }
}

export default PresenceBox;
