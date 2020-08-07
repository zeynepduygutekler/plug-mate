import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import Basic from "./Basic";
import Basic0 from "./Basic0"
import Basic1 from "./Basic1"
import Basic2 from "./Basic2"
import Basic3 from "./Basic3"
import Basic4 from "./Basic4"
import Basic5 from "./Basic5"
import "./styles.css"

function compare(a,b) {
    let comparison = 0;
    if (a.device_type > b.device_type) {
        comparison = 1;
    } else if (a.device_type < b.device_type) {
        comparison = -1
    }
    return comparison
}

// Remote Control
class RemoteControlDashboard extends Component {
    state = {
        books: [],
        current_user_id: 1
    }

    componentDidMount() {
        // Fetch data from database
        fetch('http://127.0.0.1:8000/control_interface/api/remote/')
        .then(response => response.json())
        .then(data => {
            data.sort(compare);
            var datas = []
            for (var input of data) {
                if (input.user_id === this.state.current_user_id) {
                    datas.push(input)
                }
            }
            this.setState({books: datas})
        })
    }

    updateBook = (newBook) => {
        fetch('http://127.0.0.1:8000/control_interface/api/remote/' + newBook.id.toString() + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        }).then(response => response.json())
        .then(newBook => {
            const newBooks = this.state.books.map(book => {
                if (book.id === newBook.id) {
                    return Object.assign({}, newBook)
                } else {
                    return book;
                }
            });
            this.setState({books: newBooks});
        })
    }

    render() {
        return (
            <RemoteControlList
                books={this.state.books}
                onUpdateClick={this.updateBook}
            />
        )
    }
}

class RemoteControlList extends Component {
    render() {
        const books = this.props.books.map(book => (
            <RemoteControlEditableItem
                key={book.id}
                id={book.id}
                user_id={book.user_id}
                device_type={book.device_type}
                device_state={book.device_state}
                onUpdateClick={this.props.onUpdateClick}
            />
        ));
        return (
            <>
                <div style={{float:"right"}}>
                    <p style={{marginLeft:"50px", marginBottom:"5px"}}> Master </p>
                    <RemoteToggleButton id="master" defaultChecked={true} books={this.props.books} />
                </div>
                <br/>
                <br/>
                <div style={{margin:"auto", width:"fit-content"}}>
                    {books}
                </div>
            </>
        )
    }
}

class RemoteControlEditableItem extends Component {
    handleUpdate = (book) => {
        book.id = this.props.id;
        this.props.onUpdateClick(book);
    }

    render() {
        const component = () => {
            return (
                <>
                    <RemoteControlItem
                        id={this.props.id}
                        user_id={this.props.user_id}
                        device_type={this.props.device_type}
                        device_state={this.props.device_state}
                        onFormSubmit={this.handleUpdate}
                    />
                </>
            )
        }
        return (
            component()
        )
    }
}

class RemoteControlItem extends Component {
    state = {
        user_id: this.props.user_id,
        device_type: this.props.device_type,
        device_state: this.props.device_state
    }


    handleFormSubmit = () => {
        this.props.onFormSubmit({...this.state});
    }

    onChange = (e) => {
        // Update database
        this.setState ({device_state: e.target.checked}, function() {this.handleFormSubmit()})
    }

    handleRemoteBoxClick = (e) => {
        e.preventDefault();
        if (this.state.device_state === true) {
            // Change icon to OFF
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "IconRemote").childNodes[0].className = "greyRing";

            // Toggle the switch to OFF
            document.getElementById(this.state.device_type.replace(/\s/g, '') + "ToggleRemote").checked = false;

            // Update database
            this.setState({device_state: false}, function() {
                this.handleFormSubmit();
                Main();
            })
        } else {
            // Change icon to ON
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "IconRemote").childNodes[0].className = "greenRing";

            // Toggle the switch to ON
            document.getElementById(this.state.device_type.replace(/\s/g, '') + "ToggleRemote").checked = true;

            // Update database
            this.setState({device_state: true}, function() {
                this.handleFormSubmit();
                Main();
            })
        }
    }

    render() {

        if (this.state.device_state === false) {
            var remote_control_outer_ring = "greyRing";
            var remote_control_image = "/static/Images/" + this.state.device_type.toString() + " OFF.png";
        } else {
            remote_control_outer_ring = "greenRing";
            remote_control_image = "/static/Images/" + this.state.device_type.toString() + " ON.png";
        }

        return (
            <div id={this.state.device_type.replace(/\s/g,'') + "BoxRemote"} className="containerRemote" onClick={this.handleRemoteBoxClick}>
                <p style={{textAlign:"center", fontWeight:"bold", color:"black"}}> {this.state.device_type} </p>
                <div id={this.state.device_type.replace(/\s/g,'') + "IconRemote"}>
                    <div class={remote_control_outer_ring}>
                        <div class="whiteRing">
                            <img class="PlugLoadIcon" src={remote_control_image} alt="Icon" />
                        </div>
                    </div>
                </div>
                <br/>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        className="toggle-switch-checkbox"
                        id={this.state.device_type.replace(/\s/g,'') + "ToggleRemote"}
                        checked={this.state.device_state}
                        defaultChecked={this.state.device_state}
                        onChange={this.onChange}
                    />
                    <label className="toggle-switch-label" htmlFor={this.state.device_type.replace(/\s/g,'') + "ToggleRemote"}>
                        <span className="toggle-switch-inner" data-yes="ON" data-no="OFF" />
                        <span className="toggle-switch-switch" />
                    </label>
                </div>
            </div>
        );
    }
}

class RemoteToggleButton extends Component {
    state = {
        checked: this.props.defaultChecked
    };

    constructor(props) {
        super(props);
        window.master = this;
    }

    onChange = (e) => {
        if (this.state.checked === true) {
            if (window.confirm('You are switching off all your devices.')) {
                // Switch OFF all plug loads
                if (document.getElementById("DesktopToggleRemote") !== null) {
                    if (document.getElementById("DesktopToggleRemote").checked === true) {
                        document.getElementById("DesktopToggleRemote").click();
                    }
                }
                if (document.getElementById("MonitorToggleRemote") !== null) {
                    if (document.getElementById("MonitorToggleRemote").checked === true) {
                        document.getElementById("MonitorToggleRemote").click();
                    }
                }
                if (document.getElementById("LaptopToggleRemote") !== null) {
                    if (document.getElementById("LaptopToggleRemote").checked === true) {
                        document.getElementById("LaptopToggleRemote").click();
                    }
                }
                if (document.getElementById("TaskLampToggleRemote") !== null) {
                    if (document.getElementById("TaskLampToggleRemote").checked === true) {
                        document.getElementById("TaskLampToggleRemote").click();
                    }
                }
                if (document.getElementById("FanToggleRemote") !== null) {
                    if (document.getElementById("FanToggleRemote").checked === true) {
                        document.getElementById("FanToggleRemote").click();
                    }
                }
                this.setState({checked: false})
            } else {
                this.setState({checked: true})
            }
        } else {
            if (window.confirm('You are switching on all your devices.')) {
                // Switch ON all plug loads
                if (document.getElementById("DesktopToggleRemote") !== null) {
                    if (document.getElementById("DesktopToggleRemote").checked === false) {
                        document.getElementById("DesktopToggleRemote").click();
                    }
                }
                if (document.getElementById("MonitorToggleRemote") !== null) {
                    if (document.getElementById("MonitorToggleRemote").checked === false) {
                        document.getElementById("MonitorToggleRemote").click();
                    }
                }
                if (document.getElementById("LaptopToggleRemote") !== null) {
                    if (document.getElementById("LaptopToggleRemote").checked === false) {
                        document.getElementById("LaptopToggleRemote").click();
                    }
                }
                if (document.getElementById("TaskLampToggleRemote") !== null) {
                    if (document.getElementById("TaskLampToggleRemote").checked === false) {
                        document.getElementById("TaskLampToggleRemote").click();
                    }
                }
                if (document.getElementById("FanToggleRemote") !== null) {
                    if (document.getElementById("FanToggleRemote").checked === false) {
                        document.getElementById("FanToggleRemote").click();
                    }
                }
                this.setState({checked: true})
            } else {
                this.setState({checked: false})
            }
        }
    }

    render() {
        var defaultChecked = false
        for (var book of this.props.books) {
            if (book.device_state === true) {
                defaultChecked = true
            }
        }
        return (
            <div className={"toggle-switch" + (this.props.Small ? " small-switch" : "")}>
                <input
                    type="checkbox"
                    name={this.props.Name}
                    className="toggle-switch-checkbox"
                    id={this.props.id}
                    checked={this.checked}
                    defaultChecked={defaultChecked}
                    onClick={this.onChange}
                    disabled={this.props.disabled}
                />
                {this.props.id ? (
                    <label className="toggle-switch-label" htmlFor={this.props.id}>
                        <span
                            className={this.props.disabled ? "toggle-switch-inner toggle-switch-disabled" : "toggle-switch-inner"}
                            data-yes="ON"
                            data-no="OFF"
                        />
                        <span
                            className={this.props.disabled ? "toggle-switch-switch toggle-switch-disabled": "toggle-switch-switch"}
                        />
                    </label>
                ) : null}
          </div>
        )
    }
}

ReactDOM.render(<RemoteControlDashboard />, document.getElementById('remote-control'))

function Main() {
    // If at least one plug load is ON, master button is automatically toggled to ON.
    if (document.getElementById("DesktopToggleRemote").checked || document.getElementById("MonitorToggleRemote").checked ||
        document.getElementById("LaptopToggleRemote").checked || document.getElementById("TaskLampToggleRemote").checked ||
        document.getElementById("FanToggleRemote").checked) {
        window.master.setState({checked: true});
        document.getElementById("master").checked = true;
    } else {
        // If all plug loads are OFF, master button is automatically toggled to OFF.
        if (!document.getElementById("DesktopToggleRemote").checked && !document.getElementById("MonitorToggleRemote").checked &&
            !document.getElementById("LaptopToggleRemote").checked && !document.getElementById("TaskLampToggleRemote").checked &&
            !document.getElementById("FanToggleRemote").checked) {
            window.master.setState({checked: false});
            document.getElementById("master").checked = false;
        }
    }
}

// Schedule Based control

// Define some variables
var mondaycalendar = document.getElementById("MondayCalendar");
var tuesdaycalendar = document.getElementById("TuesdayCalendar");
var wednesdaycalendar = document.getElementById("WednesdayCalendar");
var thursdaycalendar = document.getElementById("ThursdayCalendar");
var fridaycalendar = document.getElementById("FridayCalendar");
var saturdaycalendar = document.getElementById("SaturdayCalendar");
var sundaycalendar = document.getElementById("SundayCalendar");
const root = document.getElementById("root");

// Function for when "Monday" is clicked
mondaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (!mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.add("selected")
  }
  if (tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.remove("selected")
  }
  if (wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.remove("selected")
  }
  if (thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.remove("selected")
  }
  if (fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.remove("selected")
  }
  if (saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.remove("selected")
  }
  if (sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.remove("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Remove popup
  ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))

  // Add the calendar for Monday
  ReactDOM.render(
    <React.StrictMode>
      <Basic />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

// Function for when "Tuesday" is clicked
tuesdaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.remove("selected")
  }
  if (!tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.add("selected")
  }
  if (wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.remove("selected")
  }
  if (thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.remove("selected")
  }
  if (fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.remove("selected")
  }
  if (saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.remove("selected")
  }
  if (sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.remove("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Remove popup
  ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))

  // Add the calendar for Tuesday
  ReactDOM.render(
    <React.StrictMode>
      <Basic0 />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

// Function for when "Wednesday" is clicked
wednesdaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.remove("selected")
  }
  if (tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.remove("selected")
  }
  if (!wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.add("selected")
  }
  if (thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.remove("selected")
  }
  if (fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.remove("selected")
  }
  if (saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.remove("selected")
  }
  if (sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.remove("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Add the calendar for Wednesday
  ReactDOM.render(
    <React.StrictMode>
      <Basic1 />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

// Function for when "Thursday" is clicked
thursdaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.remove("selected")
  }
  if (tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.remove("selected")
  }
  if (wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.remove("selected")
  }
  if (!thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.add("selected")
  }
  if (fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.remove("selected")
  }
  if (saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.remove("selected")
  }
  if (sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.remove("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Remove popup
  ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))

  // Add the calendar for Thursday
  ReactDOM.render(
    <React.StrictMode>
      <Basic2 />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

// Close schedule popup when clicking elsewhere
document.addEventListener('mouseup', function(e) {
    var container = document.getElementById("schedule_popup");
    var timepicker = document.getElementsByClassName("rc-time-picker-panel")
    if (container !== null) {
        if (!container.contains(e.target)) {
            if (timepicker.length === 0) {
                ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))
            }
        }
    }
});


// Function for when "Friday" is clicked
fridaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.remove("selected")
  }
  if (tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.remove("selected")
  }
  if (wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.remove("selected")
  }
  if (thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.remove("selected")
  }
  if (!fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.add("selected")
  }
  if (saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.remove("selected")
  }
  if (sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.remove("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Remove popup
  ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))

  // Add the calendar for Friday
  ReactDOM.render(
    <React.StrictMode>
      <Basic3 />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

// Function for when "Saturday" is clicked
saturdaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.remove("selected")
  }
  if (tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.remove("selected")
  }
  if (wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.remove("selected")
  }
  if (thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.remove("selected")
  }
  if (fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.remove("selected")
  }
  if (!saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.add("selected")
  }
  if (sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.remove("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Remove popup
  ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))

  // Add the calendar for Saturday
  ReactDOM.render(
    <React.StrictMode>
      <Basic4 />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

// Function for when "Sunday" is clicked
sundaycalendar.onclick = function() {
  // Adjust the colours of the day buttons
  if (mondaycalendar.classList.contains("selected")) {
    mondaycalendar.classList.remove("selected")
  }
  if (tuesdaycalendar.classList.contains("selected")) {
    tuesdaycalendar.classList.remove("selected")
  }
  if (wednesdaycalendar.classList.contains("selected")) {
    wednesdaycalendar.classList.remove("selected")
  }
  if (thursdaycalendar.classList.contains("selected")) {
    thursdaycalendar.classList.remove("selected")
  }
  if (fridaycalendar.classList.contains("selected")) {
    fridaycalendar.classList.remove("selected")
  }
  if (saturdaycalendar.classList.contains("selected")) {
    saturdaycalendar.classList.remove("selected")
  }
  if (!sundaycalendar.classList.contains("selected")) {
    sundaycalendar.classList.add("selected")
  }

  // Remove previous calendar
  ReactDOM.unmountComponentAtNode(root)

  // Remove popup
  ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))

  // Add the calendar for Sunday
  ReactDOM.render(
    <React.StrictMode>
      <Basic5 />
    </React.StrictMode>,
    root
  );

  // Remove unwanted calendar header
  var header = document.getElementById("root").childNodes[0].childNodes[0].childNodes[0];
  header.removeChild(header.childNodes[0]);

  // Changing the borders
  document.getElementsByClassName("scheduler-bg-table")[0].childNodes[0].childNodes[0].childNodes[23].style.borderRight = 0;

  var i;
  var j;
  for (i=0; i<5; i++) {
    for (j=3; j<93;j+=4) {
      document.getElementsByClassName("scheduler-bg-table")[1].childNodes[0].childNodes[i].childNodes[j].style.borderRight = "1px solid #707070";
    }
  }
}

var remotecontrolelement = document.getElementById("remotecontrolrect");
var infoiconremote = document.getElementById("infoIconRemote");
var scheduleelement = document.getElementById("schedulebasedrect");
var infoiconschedule = document.getElementById("infoIcon");
var presenceelement = document.getElementById("presencebasedrect");
var infoiconpresence = document.getElementById("infoIconPresence");

window.onload = function() {

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var today = new Date();
  var day = days[today.getDay()];
  var wanted_id = day + "Calendar";
  document.getElementById(wanted_id).click();
  let remotecontrolelemRect = remotecontrolelement.getBoundingClientRect();
  let infoiconremoteRect = infoiconremote.getBoundingClientRect();
  let offsetremote = remotecontrolelemRect.right - infoiconremoteRect.right - 10;
  infoiconremote.onmouseover = function() {
    ReactDOM.render(
        <div id={"informationBoxRemote"}>
          <p style={{color:"black"}}> This control feature allows you to manually switch your plug loads ON / OFF wirelessly without having to be physically present at your desk. </p>
        </div>, document.getElementById("infoBoxRemote"));
    document.getElementById("informationBoxRemote").style.width = offsetremote.toString() + "px";
    }
  infoiconremote.onmouseout = function() {
    ReactDOM.unmountComponentAtNode(document.getElementById("infoBoxRemote"));
  }
  let scheduleelemRect = scheduleelement.getBoundingClientRect();
  let infoiconscheduleRect = infoiconschedule.getBoundingClientRect();
  let offsetschedule = scheduleelemRect.right - infoiconscheduleRect.right - 10;
  infoiconschedule.onmouseover = function() {
    ReactDOM.render(
        <div id={"informationBox"}>
          <p style={{color:"black"}}> This control feature helps you to automatically switch ON / OFF your plug loads based on a specific schedule that you have defined. </p>
        </div>, document.getElementById("infoBox"));
    document.getElementById("informationBox").style.width = offsetschedule.toString() + "px";
    }
  infoiconschedule.onmouseout = function() {
    ReactDOM.unmountComponentAtNode(document.getElementById("infoBox"));
  }
  let presenceelemRect = presenceelement.getBoundingClientRect();
  let infoiconpresenceRect = infoiconpresence.getBoundingClientRect();
  let offsetpresence = presenceelemRect.right - infoiconpresenceRect.right - 10;
  infoiconpresence.onmouseover = function() {
    ReactDOM.render(
        <div id={"informationBoxPresence"}>
          <p style={{color:"black"}}> This control feature helps to automatically switch ON your devices when you arrive at your desk and switch them OFF after you have left your desk after some time. </p>
        </div>, document.getElementById("infoBoxPresence"));
    document.getElementById("informationBoxPresence").style.width = offsetpresence.toString() + "px";
    }
  infoiconpresence.onmouseout = function() {
    ReactDOM.unmountComponentAtNode(document.getElementById("infoBoxPresence"));
  }
}

window.onresize = function() {

  let remotecontrolelemRect = remotecontrolelement.getBoundingClientRect();
  let infoiconremoteRect = infoiconremote.getBoundingClientRect();
  let offsetremote = remotecontrolelemRect.right - infoiconremoteRect.right - 10;
  infoiconremote.onmouseover = function() {
    ReactDOM.render(
        <div id={"informationBoxRemote"}>
          <p style={{color:"black"}}> This control feature allows you to manually switch your plug loads ON / OFF wirelessly without having to be physically present at your desk. </p>
        </div>, document.getElementById("infoBoxRemote"));
    document.getElementById("informationBoxRemote").style.width = offsetremote.toString() + "px";
    }
  infoiconremote.onmouseout = function() {
    ReactDOM.unmountComponentAtNode(document.getElementById("infoBoxRemote"));
  }
  let scheduleelemRect = scheduleelement.getBoundingClientRect();
  let infoiconscheduleRect = infoiconschedule.getBoundingClientRect();
  let offsetschedule = scheduleelemRect.right - infoiconscheduleRect.right - 10;
  infoiconschedule.onmouseover = function() {
    ReactDOM.render(
        <div id={"informationBox"}>
          <p style={{color:"black"}}> This control feature helps you to automatically switch ON / OFF your plug loads based on a specific schedule that you have defined. </p>
        </div>, document.getElementById("infoBox"));
    document.getElementById("informationBox").style.width = offsetschedule.toString() + "px";
    }
  infoiconschedule.onmouseout = function() {
    ReactDOM.unmountComponentAtNode(document.getElementById("infoBox"));
  }
  let presenceelemRect = presenceelement.getBoundingClientRect();
  let infoiconpresenceRect = infoiconpresence.getBoundingClientRect();
  let offsetpresence = presenceelemRect.right - infoiconpresenceRect.right - 10;
  infoiconpresence.onmouseover = function() {
    ReactDOM.render(
        <div id={"informationBoxPresence"}>
          <p style={{color:"black"}}> This control feature helps to automatically switch ON your devices when you arrive at your desk and switch them OFF after you have left your desk after some time. </p>
        </div>, document.getElementById("infoBoxPresence"));
    document.getElementById("informationBoxPresence").style.width = offsetpresence.toString() + "px";
    }
  infoiconpresence.onmouseout = function() {
    ReactDOM.unmountComponentAtNode(document.getElementById("infoBoxPresence"));
  }
}


// Added this 3 Aug
var isChromium = window.chrome;
var winNav = window.navigator;
var vendorName = winNav.vendor;
var isOpera = typeof window.opr !== "undefined";
var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
var isIOSChrome = winNav.userAgent.match("CriOS");

if (isIOSChrome) {
   // is Google Chrome on IOS
   document.onkeydown = function(event) {
if (event.ctrlKey==true || (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {
        event.preventDefault();
     }
    // 107 Num Key  +
    // 109 Num Key  -
    // 173 Min Key  hyphen/underscore key
    // 61 Plus key  +/= key
};
} else if(
  isChromium !== null &&
  typeof isChromium !== "undefined" &&
  vendorName === "Google Inc." &&
  isOpera === false &&
  isIEedge === false
) {
   // is Google Chrome
   document.onkeydown = function(event) {
if (event.ctrlKey==true || (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {
        event.preventDefault();
     }
    // 107 Num Key  +
    // 109 Num Key  -
    // 173 Min Key  hyphen/underscore key
    // 61 Plus key  +/= key
};
} else {
   // not Google Chrome
}


// Presence Based Control
class PresenceControlDashboard extends Component {
    state = {
        books: [],
        current_user_id: 1
    }

    componentDidMount() {
        // Fetch data from database
        fetch('http://127.0.0.1:8000/control_interface/api/presence/')
        .then(response => response.json())
        .then(data => {
            data.sort(compare);
            var datas = []
            for (var input of data) {
                if (input.user_id === this.state.current_user_id) {
                    datas.push(input)
                }
            }
            this.setState({books: datas})
        })
    }

    updateBook = (newBook) => {
        fetch('http://127.0.0.1:8000/control_interface/api/presence/' + newBook.id.toString() + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        }).then(response => response.json())
        .then(newBook => {
            const newBooks = this.state.books.map(book => {
                if (book.id === newBook.id) {
                    return Object.assign({}, newBook)
                } else {
                    return book;
                }
            });
            this.setState({books: newBooks});
        })
    }

    render() {
        return (
            <>
              <br/>
              <PresenceControlList
                  books={this.state.books}
                  onUpdateClick={this.updateBook}
              />
            </>
        )
    }
}

class PresenceControlList extends Component {
    render() {
        const books = this.props.books.map(book => (
            <PresenceControlEditableItem
                key={book.id}
                id={book.id}
                user_id={book.user_id}
                device_type={book.device_type}
                presence_setting={book.presence_setting}
                onUpdateClick={this.props.onUpdateClick}
            />
        ));
        return (
            <div class="plugloadboxes">
                {books}
            </div>
        )
    }
}

class PresenceControlEditableItem extends Component {
    handleUpdate = (book) => {
        book.id = this.props.id;
        this.props.onUpdateClick(book);
    }

    render() {
        const component = () => {
            return (
                <>
                    <PresenceControlItem
                        id={this.props.id}
                        user_id={this.props.user_id}
                        device_type={this.props.device_type}
                        presence_setting={this.props.presence_setting}
                        onFormSubmit={this.handleUpdate}
                    />
                </>
            )
        }
        return (
            component()
        )
    }
}

class PresenceControlItem extends Component {
    state = {
        user_id: this.props.user_id,
        device_type: this.props.device_type,
        presence_setting: this.props.presence_setting
    }

    handleFormSubmit = () => {
        this.props.onFormSubmit({...this.state});
    }

    handleSettingUpdate = (evt) => {
        if (evt.target.value !== "other" && evt.target.value !== "1000000") {
            // Hide popup
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresence").className = "invisiblePresence";
            // Update database
            this.setState({presence_setting: evt.target.value}, function() {this.handleFormSubmit()})
        }
        if (evt.target.value === "other") {
            // Show popup
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresence").className = "visiblePresence";
        }
        if (evt.target.value === "1000000") {
            // Hide popup
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresence").className = "invisiblePresence";
            if (window.confirm(`You are switching off presence-based control for ${this.state.device_type}.`)) {
                // Update database
                this.setState({presence_setting: evt.target.value}, function() {this.handleFormSubmit()})
            } else {
                // Set value to 5 minutes
                document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "5";
                this.setState({presence_setting: "5"}, function() {this.handleFormSubmit()})
            }
        }
    }

    handleOtherUpdate = (evt) => {
        this.setState({presence_setting: evt.target.value});
    }

    handlePresenceIconClick = () => {
        if (document.getElementById(this.state.device_type.replace(/\s/g,'')).className === "greenRing") {
            if (window.confirm(`You are switching off presence-based control for ${this.state.device_type}.`)) {
                // Change outer ring to red
                document.getElementById(this.state.device_type.replace(/\s/g,'')).className = "redRing"
                // Change image to OFF
                document.getElementById(this.state.device_type.replace(/\s/g,'')).childNodes[0].childNodes[0].src = "/static/Images/" + this.state.device_type.toString() + " OFF.png";
                // Set value to OFF
                document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "1000000";
                // Update database
                this.setState({presence_setting: "1000000"}, function() {this.handleFormSubmit()})
            }
        } else {
            // Change outer ring to green
            document.getElementById(this.state.device_type.replace(/\s/g,'')).className = "greenRing"
            // Change image to ON
            document.getElementById(this.state.device_type.replace(/\s/g,'')).childNodes[0].childNodes[0].src = "/static/Images/" + this.state.device_type.toString() + " ON.png";
            // Set value to 5 minutes
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "5";
            // Update database
            this.setState({presence_setting: "5"}, function() {this.handleFormSubmit()})
        }
    }

    cancelButtonClicked = () => {
        // Hide popup
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresence").className = "invisiblePresence";
        // Set value to 5 minutes
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "5";
    }

    okButtonClicked = (evt) => {
        // Display value on dropdown
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = document.getElementById(this.state.device_type.replace(/\s/g,'') + "TextOther").value;
        // Clear text box on popup
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "TextOther").value = "";
        // Hide popup
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresence").className = "invisiblePresence";
        // Update database
        this.handleFormSubmit();
    }

    render() {
        const possible_option = ["1000000", "5", "10", "20", "30", "60", "other"]
        if (possible_option.includes(this.state.presence_setting.toString())) {
            var disabled = true;
            var display_value = "";
            var display_text = "";
        } else {
            disabled = false;
            display_value = this.state.presence_setting;
            display_text = this.state.presence_setting + " minutes";
        }

        if (this.state.presence_setting.toString() === "1000000") {
            var presence_control_outer_ring = "redRing";
            var presence_control_image = "/static/Images/" + this.state.device_type.toString() + " OFF.png";
        } else {
            presence_control_outer_ring = "greenRing";
            presence_control_image = "/static/Images/" + this.state.device_type.toString() + " ON.png";
        }

        var label = "Off " + this.state.device_type + " after I leave for:"
        return (
            <div id={this.state.device_type.replace(/\s/g,'') + "BoxPresence"} className="containerPresence">
                <div className="iconPresence">
                    <div className={presence_control_outer_ring} id={this.state.device_type.replace(/\s/g,'')} onClick={this.handlePresenceIconClick}>
                        <div className="whiteRing">
                            <img class="PlugLoadIcon" src={presence_control_image} alt="Icon" />
                        </div>
                    </div>
                </div>
                <div style={{width:"200px", height:"10px", overflowY:"visible"}}>
                    <div style={{position:"relative", width:"200px", height:"1px", overflowY:"visible"}}>
                        <div className="dropdownPresence" id={this.state.device_type.replace(/\s/g,'') + "Dropdown"}>
                            <div class="wordPresence">
                                <p> {this.state.device_type} </p>
                            </div>
                            <select defaultValue={this.state.presence_setting} onChange={this.handleSettingUpdate} id={this.state.device_type.replace(/\s/g,'') + "Select"}>
                                <option value="1000000"> Deactivate </option>
                                <optgroup label={label}>
                                    <option value="5"> 5 minutes </option>
                                    <option value="10"> 10 minutes </option>
                                    <option value="20"> 20 minutes </option>
                                    <option value="30"> 30 minutes </option>
                                    <option value="60"> 1 hour </option>
                                    <option value="other"> Custom Time </option>
                                </optgroup>
                                <option value={display_value} disabled={disabled}> {display_text} </option>
                            </select>
                        </div>
                        <div id={this.state.device_type.replace(/\s/g,'') + "PopupPresence"} className="invisiblePresence">
                            <input type="text" id={this.state.device_type.replace(/\s/g,'') + "TextOther"} onChange={this.handleOtherUpdate} />
                            <p class="minutes"> minutes </p>
                            <br />
                            <button id={this.state.device_type.replace(/\s/g,'') + "CancelButton"} onClick={this.cancelButtonClicked}> Cancel </button>
                            <button id={this.state.device_type.replace(/\s/g,'') + "OkButton"} onClick={this.okButtonClicked}> OK </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<PresenceControlDashboard />, document.getElementById('presence-based-control'))