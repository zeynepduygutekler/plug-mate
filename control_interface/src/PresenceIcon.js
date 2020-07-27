// Component for icon and plug load name

import React from "react";
import "./PresenceIcon.css";

class PresenceIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plugLoad: this.props.plugload, // current plug load
      plugLoadExtra: "", // additional string to help with task lamp formatting
      imageSource: "/static/Images/" + this.props.plugload.toString() + " OFF" + ".png"
    };
  }
  render() {
    // if the plug load is task lamp, format from TaskLamp to Task Lamp
    if (this.state.plugLoad === "TaskLamp") {
      this.state.plugLoadExtra = "Task Lamp";
      this.state.imageSource = "/static/Images/Task Lamp OFF.png"
    } else {
      this.state.plugLoadExtra = this.state.plugLoad;
    }
    return (
      <>
        <div style={{display:"inline-block"}} className="redPresence" id={this.state.plugLoad}>
          <div style={{display:"inline-block"}} className="whitePresence">
            <img className="PresencePlugLoadIcon" src={this.state.imageSource} alt="Icon" />
          </div>
        </div>

      </>
    );
  }
}

export default PresenceIcon;
