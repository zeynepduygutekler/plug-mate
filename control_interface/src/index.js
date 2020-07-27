import React from 'react';
import ReactDOM from 'react-dom';
import RemoteToggleButton from './RemoteToggleButton';
import RemoteBox from './RemoteBox';
import './index.css'
import PresenceBox from './PresenceBox';
import PresenceDropdown from './PresenceDropdown';
import PresenceIcon from './PresenceIcon';
import Basic from "./Basic";
import Basic0 from "./Basic0"
import Basic1 from "./Basic1"
import Basic2 from "./Basic2"
import Basic3 from "./Basic3"
import Basic4 from "./Basic4"
import Basic5 from "./Basic5"
import "./styles.css"
import './PresenceIcon.css'


// Remote Control
ReactDOM.render(
  <React.StrictMode>
    <>
      <div style={{float:"right"}}>
        <p style={{marginLeft: "50px", marginBottom:"5px"}}> Master </p>
        <RemoteToggleButton id="master" defaultChecked="true" />
      </div>
      <br />
      <br />

      <div className={'col-xlg-6'}>
        <div style={{margin:"auto", width:"900px"}}>
          <RemoteBox id="Desktop" />
          <RemoteBox id="Monitor"/>
          <RemoteBox id="Laptop" />
          <RemoteBox id="TaskLamp"/>
          <RemoteBox id="Fan" />
        </div>
      </div>
    </>
  </React.StrictMode>,
  document.getElementById('remote-control')
);

// Define necessary variables
var master = document.getElementById("master"); // Master toggle button
var desktop = document.getElementById("DesktopBoxRemote"); // Final component for desktop
var desktopImage = document.getElementById("DesktopIconRemote").childNodes[0].childNodes[0].childNodes[0]; // Icon image for desktop (to be changed between green and grey)
var desktopRing = document.getElementById("DesktopIconRemote").childNodes[0]; // Outer ring for desktop (to be changed between green and grey)
var monitor = document.getElementById("MonitorBoxRemote"); // Final component for monitor
var monitorImage = document.getElementById("MonitorIconRemote").childNodes[0].childNodes[0].childNodes[0]; // Icon image for monitor (to be changed between green and grey)
var monitorRing = document.getElementById("MonitorIconRemote").childNodes[0]; // Outer ring for monitor (to be changed between green and grey)
var laptop = document.getElementById("LaptopBoxRemote"); // Final component for laptop
var laptopImage = document.getElementById("LaptopIconRemote").childNodes[0].childNodes[0].childNodes[0]; // Icon image for laptop (to be changed between green and grey)
var laptopRing = document.getElementById("LaptopIconRemote").childNodes[0]; // Outer ring for laptop (to be changed between green and grey)
var tasklamp = document.getElementById("TaskLampBoxRemote"); // Final component for task lamp
var tasklampImage = document.getElementById("TaskLampIconRemote").childNodes[0].childNodes[0].childNodes[0]; // Icon image for task lamp (to be changed between green and grey)
var tasklampRing = document.getElementById("TaskLampIconRemote").childNodes[0]; // Outer ring for task lamp (to be changed between green and grey)
var fan = document.getElementById("FanBoxRemote"); // Final component for fan
var fanImage = document.getElementById("FanIconRemote").childNodes[0].childNodes[0].childNodes[0]; // Icon image for fan (to be changed between green and grey)
var fanRing = document.getElementById("FanIconRemote").childNodes[0]; // Outer ring for fan (to be changed between green and grey)

// Define function for when master button is clicked
master.onclick = function() {
  if (document.getElementById("master").checked === true) {
    // Switch ON all plug loads if master button is confirmed to be turned ON
    if (window.confirm("You are switching on all your plug loads.")) {
      // Switch desktop toggle button to ON
      document.getElementById("DesktopToggleRemote").checked = true;
      // Green image should be shown
      desktopImage.src = "/static/Images/Desktop ON.png";
      // Outer circle should be green
      desktopRing.classList.remove("greyRemote");
      desktopRing.classList.add("greenRemote");

      // Switch monitor toggle button to ON
      document.getElementById("MonitorToggleRemote").checked = true;
      // Green image should be shown
      monitorImage.src = "/static/Images/Monitor ON.png";
      // Outer circle should be green
      monitorRing.classList.remove("greyRemote");
      monitorRing.classList.add("greenRemote");

      // Switch laptop toggle button to ON
      document.getElementById("LaptopToggleRemote").checked = true;
      // Green image should be shown
      laptopImage.src = "/static/Images/Laptop ON.png";
      // Outer circle should be green
      laptopRing.classList.remove("greyRemote");
      laptopRing.classList.add("greenRemote");

      // Switch task lamp toggle button to ON
      document.getElementById("TaskLampToggleRemote").checked = true;
      // Green image should be shown
      tasklampImage.src = "/static/Images/Task Lamp ON.png";
      // Outer circle should be green
      tasklampRing.classList.remove("greyRemote");
      tasklampRing.classList.add("greenRemote");

      // Switch fan toggle button to ON
      document.getElementById("FanToggleRemote").checked = true;
      // Green image should be shown
      fanImage.src = "/static/Images/Fan ON.png";
      // Outer circle should be green
      fanRing.classList.remove("greyRemote");
      fanRing.classList.add("greenRemote");
    } else {
      // Nothing happens if user does not confirm to switch ON all plug loads
      // Master button remains OFF
      document.getElementById("master").checked = false;
    }
  } else {
    // Switch OFF all plug loads if master button is confirmed to be turned OFF
    if (window.confirm("You are switching off all your plug loads.")) {
      // Switch desktop toggle button to OFF
      document.getElementById("DesktopToggleRemote").checked = false;
      // Grey image should be shown
      desktopImage.src = "/static/Images/Desktop OFF.png";
      // Outer circle should be grey
      desktopRing.classList.remove("greenRemote");
      desktopRing.classList.add("greyRemote");

      // Switch monitor toggle button to OFF
      document.getElementById("MonitorToggleRemote").checked = false;
      // Grey image should be shown
      monitorImage.src = "/static/Images/Monitor OFF.png";
      // Outer ring should be grey
      monitorRing.classList.remove("greenRemote");
      monitorRing.classList.add("greyRemote");

      // Switch laptop toggle button to OFF
      document.getElementById("LaptopToggleRemote").checked = false;
      // Grey image should be shown
      laptopImage.src = "/static/Images/Laptop OFF.png";
      // Outer ring should be grey
      laptopRing.classList.remove("greenRemote");
      laptopRing.classList.add("greyRemote");

      // Switch task lamp toggle button to OFF
      document.getElementById("TaskLampToggleRemote").checked = false;
      // Grey image should be shown
      tasklampImage.src = "/static/Images/Task Lamp OFF.png";
      // Outer ring should be grey
      tasklampRing.classList.remove("greenRemote");
      tasklampRing.classList.add("greyRemote");

      // Switch fan toggle button to OFF
      document.getElementById("FanToggleRemote").checked = false;
      // Grey image should be shown
      fanImage.src = "/static/Images/Fan OFF.png";
      // Outer ring should be grey
      fanRing.classList.remove("greenRemote");
      fanRing.classList.add("greyRemote");
    } else {
      // Nothing happens if user does not confirm to switch OFF all plug loads
      // Master button remains ON
      document.getElementById("master").checked = true;
    }
  }
}


// Define function for when desktop component is clicked
desktop.onclick = function() {
  // Toggle the switch
  document.getElementById("DesktopToggleRemote").checked = !document.getElementById("DesktopToggleRemote").checked

  // Get the current state (ON/OFF) of the plug load
  var current_state = document.getElementById("DesktopToggleRemote").checked

  if (current_state === true) {
    // If ON, image and outer ring should be green
    desktopImage.src = "/static/Images/Desktop ON.png";
    desktopRing.classList.remove("greyRemote");
    desktopRing.classList.add("greenRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  } else {
    // If OFF, image and outer ring should be grey
    desktopImage.src = "/static/Images/Desktop OFF.png";
    desktopRing.classList.remove("greenRemote");
    desktopRing.classList.add("greyRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  }
}

// Define function for when monitor component is clicked
monitor.onclick = function() {
  // Toggle the switch
  document.getElementById("MonitorToggleRemote").checked = !document.getElementById("MonitorToggleRemote").checked

  // Get the current state (ON/OFF) of the plug load
  var current_state = document.getElementById("MonitorToggleRemote").checked

  if (current_state === true) {
    // If ON, image and outer ring should be green
    monitorImage.src = "/static/Images/Monitor ON.png";
    monitorRing.classList.remove("greyRemote");
    monitorRing.classList.add("greenRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  } else {
    // If OFF, image and outer ring should be grey
    monitorImage.src = "/static/Images/Monitor OFF.png";
    monitorRing.classList.remove("greenRemote");
    monitorRing.classList.add("greyRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  }
}

// Define function for when laptop component is clicked
laptop.onclick = function() {
  // Toggle the switch
  document.getElementById("LaptopToggleRemote").checked = !document.getElementById("LaptopToggleRemote").checked

  // Get the current state (ON/OFF) of the plug load
  var current_state = document.getElementById("LaptopToggleRemote").checked

  if (current_state === true) {
    // If ON, image and outer ring should be green
    laptopImage.src = "/static/Images/Laptop ON.png";
    laptopRing.classList.remove("greyRemote");
    laptopRing.classList.add("greenRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  } else {
    // If OFF, image and outer ring should be grey
    laptopImage.src = "/static/Images/Laptop OFF.png";
    laptopRing.classList.remove("greenRemote");
    laptopRing.classList.add("greyRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  }
}

// Define function for when task lamp component is clicked
tasklamp.onclick = function() {
  // Toggle the switch
  document.getElementById("TaskLampToggleRemote").checked = !document.getElementById("TaskLampToggleRemote").checked

  // Get the current state (ON/OFF) of the plug load
  var current_state = document.getElementById("TaskLampToggleRemote").checked

  if (current_state === true) {
    // If ON, image and outer ring should be green
    tasklampImage.src = "/static/Images/Task Lamp ON.png";
    tasklampRing.classList.remove("greyRemote");
    tasklampRing.classList.add("greenRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  } else {
    // If OFF, image and outer ring should be grey
    tasklampImage.src = "/static/Images/Task Lamp OFF.png";
    tasklampRing.classList.remove("greenRemote");
    tasklampRing.classList.add("greyRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  }
}

// Define the function for when fan component is clicked
fan.onclick = function() {
  // Toggle the switch
  document.getElementById("FanToggleRemote").checked = !document.getElementById("FanToggleRemote").checked

  // Get the current state (ON/OFF) of the plug load
  var current_state = document.getElementById("FanToggleRemote").checked

  if (current_state === true) {
    // If ON, image and outer ring should be green
    fanImage.src = "/static/Images/Fan ON.png";
    fanRing.classList.remove("greyRemote");
    fanRing.classList.add("greenRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  } else {
    // If OFF, image and outer ring should be grey
    fanImage.src = "/static/Images/Fan OFF.png";
    fanRing.classList.remove("greenRemote");
    fanRing.classList.add("greyRemote");

    // If at least one plug load is ON, master button is automatically toggled to ON.
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    Main()
  }
}


function Main() {
  // If at least one plug load is ON, master button is automatically toggled to ON.
  if (document.getElementById("DesktopToggleRemote").checked || document.getElementById("MonitorToggleRemote").checked || document.getElementById("LaptopToggleRemote").checked || document.getElementById("TaskLampToggleRemote").checked || document.getElementById("FanToggleRemote").checked) {
    document.getElementById("master").checked = true;
  } else {
    // If all plug loads are OFF, master button is automatically toggled to OFF.
    if (!document.getElementById("DesktopToggleRemote").checked && !document.getElementById("MonitorToggleRemote").checked && !document.getElementById("LaptopToggleRemote").checked && !document.getElementById("TaskLampToggleRemote").checked && !document.getElementById("FanToggleRemote").checked) {
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



// Presence Based Control
ReactDOM.render(
  <React.StrictMode>
    <>
      <br/>
      <div className="plugloadboxes" style={{margin:"auto", width:"80vw"}}>
        <div id="DesktopBoxPresence" className="containerPresence">
          <div className="iconPresence">
            <PresenceIcon plugload="Desktop" />
          </div>
          <div style={{width:"200px", height:"10px", overflowY:"visible"}}>
            <div style={{position:"relative", width:"200px", height:"1px", overflowY:"visible"}}>
              <div className="dropdownPresence" id="Desktopdropdown">
                <PresenceDropdown current="Desktop" />
              </div>
              <div id="DesktopPopupPresence" className="invisiblePresence">
                <input type="text" style={{width:"35px", textAlign:"center", display:"inline-block"}} id="desktopTextOther" />
                <p style={{fontSize:"14px", marginLeft:"10px", display:"inline-block", color:"black"}}> minutes </p>
                <br/>
                <button id="desktopCancelButton" onClick={desktopCancelButtonClicked}> Cancel </button>
                <button style={{marginLeft: "5px", background: "#1cc88a"}}  id="desktopOkButton" onClick={desktopOKButtonClicked}> OK </button>
              </div>
            </div>
          </div>
        </div>
        <div id="MonitorBoxPresence" className="containerPresence">
          <div className="iconPresence">
            <PresenceIcon plugload="Monitor" />
          </div>
          <div style={{width:"200px", height:"10px", overflowY:"visible"}}>
            <div style={{position:"relative", width:"200px", height:"1px", overflowY:"visible"}}>
              <div className="dropdownPresence" id="Monitordropdown">
                <PresenceDropdown current="Monitor" />
              </div>
              <div id="MonitorPopupPresence" className="invisiblePresence">
                <input style={{width:"35px", textAlign:"center", display:"inline-block"}} type="text" id="monitorTextOther" />
                <p style={{fontSize:"12px", marginLeft:"10px", display:"inline-block"}}> minutes </p>
                <br/>
                <button id="monitorCancelButton" onClick={monitorCancelButtonClicked}> Cancel </button>
                <button style={{marginLeft: "5px", background: "#1cc88a"}}  id="monitorOkButton" onClick={monitorOKButtonClicked}> OK </button>
              </div>
            </div>
          </div>
        </div>
        <div id="LaptopBoxPresence" className="containerPresence">
          <div className="iconPresence">
            <PresenceIcon plugload="Laptop" />
          </div>
          <div style={{width:"200px", height:"10px", overflowY:"visible"}}>
            <div style={{position:"relative", width:"200px", height:"10px", overflowY:"visible"}}>
              <div className="dropdownPresence" id="Laptopdropdown">
                <PresenceDropdown current="Laptop" />
              </div>
              <div id="LaptopPopupPresence" className="invisiblePresence">
                <input style={{width:"35px", textAlign:"center", display:"inline-block"}} type="text" id="laptopTextOther" />
                <p style={{fontSize:"12px", marginLeft:"10px", display:"inline-block"}}> minutes </p>
                <br/>
                <button id="laptopCancelButton" onClick={laptopCancelButtonClicked}> Cancel </button>
                <button style={{marginLeft: "5px", background: "#1cc88a"}}  id="laptopOkButton" onClick={laptopOKButtonClicked}> OK </button>
              </div>
            </div>
          </div>
        </div>
        <div id="TasklampBoxPresence" className="containerPresence">
          <div className="iconPresence">
            <PresenceIcon plugload="TaskLamp" />
          </div>
          <div style={{width:"200px", height:"10px", overflowY:"visible"}}>
            <div style={{position:"relative", width:"200px", height:"10px", overflowY:"visible"}}>
              <div className="dropdownPresence" id="TaskLampdropdown">
                <PresenceDropdown current="TaskLamp" />
              </div>
              <div id="TaskLampPopupPresence" className="invisiblePresence">
                <input style={{width:"35px", textAlign:"center", display:"inline-block"}} type="text" id="tasklampTextOther" />
                <p style={{fontSize:"12px", marginLeft:"10px", display:"inline-block"}}> minutes </p>
                <br/>
                <button id="tasklampCancelButton" onClick={tasklampCancelButtonClicked}> Cancel </button>
                <button style={{marginLeft: "5px", background: "#1cc88a"}}  id="tasklampOkButton" onClick={tasklampOKButtonClicked}> OK </button>
              </div>
            </div>
          </div>
        </div>
        <div id="FanBoxPresence" className="containerPresence">
          <div className="iconPresence">
            <PresenceIcon plugload="Fan" />
          </div>
          <div style={{width:"200px", height:"10px", overflowY:"visible"}}>
            <div style={{position:"relative", width:"200px", height:"10px", overflowY:"visible"}}>
              <div className="dropdownPresence" id="Fandropdown">
                <PresenceDropdown current="Fan" />
              </div>
              <div id="FanPopupPresence" className="invisiblePresence">
                <input style={{width:"35px", textAlign:"center", display:"inline-block"}} type="text" id="fanTextOther" />
                <p style={{fontSize:"12px", marginLeft:"10px", display:"inline-block"}}> minutes </p>
                <br/>
                <button id="fanCancelButton" onClick={fanCancelButtonClicked}> Cancel </button>
                <button style={{marginLeft: "5px", background: "#1cc88a"}} id="fanOkButton" onClick={fanOKButtonClicked}> OK </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  </React.StrictMode>,
  document.getElementById('presence-based-control')
);

// DESKTOP POPUP
var onchangeDesktop = document.getElementById("Desktopdropdown").childNodes[1]
var desktop_popup = document.getElementById("DesktopPopupPresence")
var desktoppresence = document.getElementById("Desktop");
var desktop_presence_plugload_icon = document.getElementById("DesktopBoxPresence").childNodes[0].childNodes[0].childNodes[0].childNodes[0]
onchangeDesktop.onchange = function() {
  // If "Other" is chosen for Desktop, show popup
  if (onchangeDesktop.value === "other") {
    desktoppresence.className = "greenPresence";
    desktop_presence_plugload_icon.src = "/static/Images/Desktop ON.png";
    desktop_popup.classList.remove("invisiblePresence");
    desktop_popup.classList.add("visiblePresence");
    var element = document.getElementById("informationBoxPresence");
    if (element !== null) {
      ReactDOM.unmountComponentAtNode(document.getElementById('infoBoxPresence'));
    }
  } else {
    desktop_popup.classList.remove("visiblePresence");
    desktop_popup.classList.add("invisiblePresence");
    if (onchangeDesktop.value === "off") {
      if (window.confirm("You are switching off presence-based control for Desktop.")) {
        desktoppresence.className = "redPresence";
        desktop_presence_plugload_icon.src = "/static/Images/Desktop OFF.png";
      } else {
        onchangeDesktop.value = "5 minutes";
        desktoppresence.className = "greenPresence";
        desktop_presence_plugload_icon.src = "/static/Images/Desktop ON.png";
      }
    } else {
      desktoppresence.className = "greenPresence"
      desktop_presence_plugload_icon.src = "/static/Images/Desktop ON.png"
    }
  }
  // Remove the option for the value that user gives for "Other"
  if (document.getElementById("Desktopselect").childNodes.length !== 2) {
    document.getElementById("Desktopselect").removeChild(document.getElementById("desktopchosenother"));
  }
}

// If cancel is clicked, close popup and set the timing back to 1 minute
function desktopCancelButtonClicked() {
  desktop_popup.classList.remove("visiblePresence");
  desktop_popup.classList.add("invisiblePresence");
  onchangeDesktop.value = "5 minutes"
}

// If ok is clicked, add that option into the dropdown so that it can be displayed
// Hide the popup
function desktopOKButtonClicked() {
  var number_input = document.getElementById("desktopTextOther").value + " minutes";
  desktop_popup.classList.remove("visiblePresence");
  desktop_popup.classList.add("invisiblePresence");
  var new_option = document.createElement("option");
  new_option.text = number_input
  new_option.id = "desktopchosenother"
  document.getElementById("Desktopselect").add(new_option)
  onchangeDesktop.value = number_input
}

// MONITOR POPUP
var onchangeMonitor = document.getElementById("Monitordropdown").childNodes[1];
var monitor_popup = document.getElementById("MonitorPopupPresence")
var monitorpresence = document.getElementById("Monitor");
var monitor_presence_plugload_icon = document.getElementById("MonitorBoxPresence").childNodes[0].childNodes[0].childNodes[0].childNodes[0]
onchangeMonitor.onchange = function() {
  // If "Other" is chosen for Desktop, show popup
  if (onchangeMonitor.value === "other") {
    monitorpresence.className = "greenPresence";
    monitor_presence_plugload_icon.src = "/static/Images/Monitor ON.png";
    monitor_popup.classList.remove("invisiblePresence");
    monitor_popup.classList.add("visiblePresence");
    var element = document.getElementById("informationBoxPresence");
    if (element !== null) {
      ReactDOM.unmountComponentAtNode(document.getElementById('infoBoxPresence'));
    }
  } else {
    monitor_popup.classList.remove("visiblePresence");
    monitor_popup.classList.add("invisiblePresence");
    if (onchangeMonitor.value === "off") {
      if (window.confirm("You are switching off presence-based control for Monitor.")) {
        monitorpresence.className = "redPresence";
        monitor_presence_plugload_icon.src = "/static/Images/Monitor OFF.png";
      } else {
        onchangeMonitor.value = "5 minutes";
        monitorpresence.className = "greenPresence";
        monitor_presence_plugload_icon.src = "/static/Images/Monitor ON.png";
      }
    } else {
      monitorpresence.className = "greenPresence"
      monitor_presence_plugload_icon.src = "/static/Images/Monitor ON.png"
    }
  }
  // Remove the option for the value that user gives for "Other"
  if (document.getElementById("Monitorselect").childNodes.length !== 2) {
    document.getElementById("Monitorselect").removeChild(document.getElementById("monitorchosenother"));
  }
}

// If cancel is clicked, close popup and set the timing back to 1 minute
function monitorCancelButtonClicked() {
  monitor_popup.classList.remove("visiblePresence");
  monitor_popup.classList.add("invisiblePresence");
  onchangeMonitor.value = "5 minutes"
}

// If ok is clicked, add that option into the dropdown so that it can be displayed
// Hide the popup
function monitorOKButtonClicked() {
  var number_input = document.getElementById("monitorTextOther").value + " minutes";
  monitor_popup.classList.remove("visiblePresence");
  monitor_popup.classList.add("invisiblePresence");
  var new_option = document.createElement("option");
  new_option.text = number_input
  new_option.id = "monitorchosenother"
  document.getElementById("Monitorselect").add(new_option)
  onchangeMonitor.value = number_input
}


// LAPTOP POPUP
var onchangeLaptop = document.getElementById("Laptopdropdown").childNodes[1];
var laptop_popup = document.getElementById("LaptopPopupPresence")
var laptoppresence = document.getElementById("Laptop");
var laptop_presence_plugload_icon = document.getElementById("LaptopBoxPresence").childNodes[0].childNodes[0].childNodes[0].childNodes[0]

onchangeLaptop.onchange = function() {
  // If "Other" is chosen for Laptop, show popup
  if (onchangeLaptop.value === "other") {
    laptoppresence.className = "greenPresence";
    laptop_presence_plugload_icon.src = "/static/Images/Laptop ON.png";
    laptop_popup.classList.remove("invisiblePresence");
    laptop_popup.classList.add("visiblePresence");
    var element = document.getElementById("informationBoxPresence");
    if (element !== null) {
      ReactDOM.unmountComponentAtNode(document.getElementById('infoBoxPresence'));
    }
  } else {
    laptop_popup.classList.remove("visiblePresence");
    laptop_popup.classList.add("invisiblePresence");
    if (onchangeLaptop.value === "off") {
      if (window.confirm("You are switching off presence-based control for Laptop.")) {
        laptoppresence.className = "redPresence";
        laptop_presence_plugload_icon.src = "/static/Images/Laptop OFF.png";
      } else {
        onchangeLaptop.value = "5 minutes";
        laptoppresence.className = "greenPresence";
        laptop_presence_plugload_icon.src = "/static/Images/Laptop ON.png";
      }
    } else {
      laptoppresence.className = "greenPresence"
      laptop_presence_plugload_icon.src = "/static/Images/Laptop ON.png"
    }
  }
  // Remove the option for the value that user gives for "Other"
  if (document.getElementById("Laptopselect").childNodes.length !== 2) {
    document.getElementById("Laptopselect").removeChild(document.getElementById("laptopchosenother"));
  }
}

// If cancel is clicked, close popup and set the timing back to 1 minute
function laptopCancelButtonClicked() {
  laptop_popup.classList.remove("visiblePresence");
  laptop_popup.classList.add("invisiblePresence");
  onchangeLaptop.value = "5 minutes"
}

// If ok is clicked, add that option into the dropdown so that it can be displayed
// Hide the popup
function laptopOKButtonClicked() {
  var number_input = document.getElementById("laptopTextOther").value + " minutes";
  laptop_popup.classList.remove("visiblePresence");
  laptop_popup.classList.add("invisiblePresence");
  var new_option = document.createElement("option");
  new_option.text = number_input
  new_option.id = "laptopchosenother"
  document.getElementById("Laptopselect").add(new_option)
  onchangeLaptop.value = number_input
}

// TASK LAMP POPUP

var onchangeTasklamp = document.getElementById("TaskLampdropdown").childNodes[1];
var tasklamp_popup = document.getElementById("TaskLampPopupPresence")
var tasklamppresence = document.getElementById("TaskLamp");
var tasklamp_presence_plugload_icon = document.getElementById("TasklampBoxPresence").childNodes[0].childNodes[0].childNodes[0].childNodes[0]

onchangeTasklamp.onchange = function() {
  // If "Other" is chosen for Task Lamp, show popup
  if (onchangeTasklamp.value === "other") {
    tasklamppresence.className = "greenPresence";
    tasklamp_presence_plugload_icon.src = "/static/Images/Task Lamp ON.png";
    tasklamp_popup.classList.remove("invisiblePresence");
    tasklamp_popup.classList.add("visiblePresence");
    var element = document.getElementById("informationBoxPresence");
    if (element !== null) {
      ReactDOM.unmountComponentAtNode(document.getElementById('infoBoxPresence'));
    }
  } else {
    tasklamp_popup.classList.remove("visiblePresence");
    tasklamp_popup.classList.add("invisiblePresence");
    if (onchangeTasklamp.value === "off") {
      if (window.confirm("You are switching off presence-based control for Task Lamp.")) {
        tasklamppresence.className = "redPresence";
        tasklamp_presence_plugload_icon.src = "/static/Images/Task Lamp OFF.png";
      } else {
        onchangeTasklamp.value = "5 minutes";
        tasklamppresence.className = "greenPresence";
        tasklamp_presence_plugload_icon.src = "/static/Images/Task Lamp ON.png";
      }
    } else {
      tasklamppresence.className = "greenPresence"
      tasklamp_presence_plugload_icon.src = "/static/Images/Task Lamp ON.png"
    }
  }
  // Remove the option for the value that user gives for "Other"
  if (document.getElementById("TaskLampselect").childNodes.length !== 2) {
    document.getElementById("TaskLampselect").removeChild(document.getElementById("tasklampchosenother"));
  }
}

// If cancel is clicked, close popup and set the timing back to 1 minute
function tasklampCancelButtonClicked() {
  tasklamp_popup.classList.remove("visiblePresence");
  tasklamp_popup.classList.add("invisiblePresence");
  onchangeTasklamp.value = "5 minutes"
}

// If ok is clicked, add that option into the dropdown so that it can be displayed
// Hide the popup
function tasklampOKButtonClicked() {
  var number_input = document.getElementById("tasklampTextOther").value + " minutes";
  tasklamp_popup.classList.remove("visiblePresence");
  tasklamp_popup.classList.add("invisiblePresence");
  var new_option = document.createElement("option");
  new_option.text = number_input
  new_option.id = "tasklampchosenother"
  document.getElementById("TaskLampselect").add(new_option)
  onchangeTasklamp.value = number_input
}

// FAN POPUP

var onchangeFan = document.getElementById("Fandropdown").childNodes[1];
var fan_popup = document.getElementById("FanPopupPresence")
var fanpresence = document.getElementById("Fan");
var fan_presence_plugload_icon = document.getElementById("FanBoxPresence").childNodes[0].childNodes[0].childNodes[0].childNodes[0]

onchangeFan.onchange = function() {
  // If "Other" is chosen for Fan, show popup
  if (onchangeFan.value === "other") {
    fanpresence.className = "greenPresence";
    fan_presence_plugload_icon.src = "/static/Images/Fan ON.png";
    fan_popup.classList.remove("invisiblePresence");
    fan_popup.classList.add("visiblePresence");
    var element = document.getElementById("informationBoxPresence");
    if (element !== null) {
      ReactDOM.unmountComponentAtNode(document.getElementById('infoBoxPresence'));
    }
  } else {
    fan_popup.classList.remove("visiblePresence");
    fan_popup.classList.add("invisiblePresence");
    if (onchangeFan.value === "off") {
      if (window.confirm("You are switching off presence-based control for Fan.")) {
        fanpresence.className = "redPresence";
        fan_presence_plugload_icon.src = "/static/Images/Fan OFF.png";
      } else {
        onchangeFan.value = "5 minutes";
        fanpresence.className = "greenPresence";
        fan_presence_plugload_icon.src = "/static/Images/Fan ON.png";
      }
    } else {
      fanpresence.className = "greenPresence"
      fan_presence_plugload_icon.src = "/static/Images/Fan ON.png"
    }
  }
  // Remove the option for the value that user gives for "Other"
  if (document.getElementById("Fanselect").childNodes.length !== 2) {
    document.getElementById("Fanselect").removeChild(document.getElementById("fanchosenother"));
  }
}

// If cancel is clicked, close popup and set the timing back to 1 minute
function fanCancelButtonClicked() {
  fan_popup.classList.remove("visiblePresence");
  fan_popup.classList.add("invisiblePresence");
  onchangeFan.value = "5 minutes"
}

// If ok is clicked, add that option into the dropdown so that it can be displayed
// Hide the popup
function fanOKButtonClicked() {
  var number_input = document.getElementById("fanTextOther").value + " minutes";
  fan_popup.classList.remove("visiblePresence");
  fan_popup.classList.add("invisiblePresence");
  var new_option = document.createElement("option");
  new_option.text = number_input
  new_option.id = "fanchosenother"
  document.getElementById("Fanselect").add(new_option)
  onchangeFan.value = number_input
}

// Turning presence control on for Desktop
var desktopDropdown = document.getElementById("Desktopdropdown");
desktoppresence.onclick = function() {
  if (desktoppresence.className === "redPresence") {
    desktoppresence.className = "greenPresence";
    desktop_presence_plugload_icon.src = "/static/Images/Desktop ON.png"
    desktopDropdown.childNodes[1].value = "5 minutes"
  } else {
    desktoppresence.className = "redPresence";
    desktop_presence_plugload_icon.src = "/static/Images/Desktop OFF.png"
    desktopDropdown.childNodes[1].value = "off"
  }
}

// Turning presence control on for Monitor
var monitorDropdown = document.getElementById("Monitordropdown");
monitorpresence.onclick = function() {
  if (monitorpresence.className === "redPresence") {
    monitorpresence.className = "greenPresence";
    monitorDropdown.childNodes[1].value = "5 minutes"
    monitor_presence_plugload_icon.src = "/static/Images/Monitor ON.png"
  } else {
    monitorpresence.className = "redPresence";
    monitor_presence_plugload_icon.src = "/static/Images/Monitor OFF.png"
    monitorDropdown.childNodes[1].value = "off"
  }
}

// Turning presence control on for Laptop
var laptopDropdown = document.getElementById("Laptopdropdown");
laptoppresence.onclick = function() {
  if (laptoppresence.className === "redPresence") {
    laptoppresence.className = "greenPresence";
    laptopDropdown.childNodes[1].value = "5 minutes"
    laptop_presence_plugload_icon.src = "/static/Images/Laptop ON.png"
  } else {
    laptoppresence.className = "redPresence";
    laptop_presence_plugload_icon.src = "/static/Images/Laptop OFF.png"
    laptopDropdown.childNodes[1].value = "off"
  }
}

// Turning presence control on for Task Lamp
var tasklampDropdown = document.getElementById("TaskLampdropdown");
tasklamppresence.onclick = function() {
  if (tasklamppresence.className === "redPresence") {
    tasklamppresence.className = "greenPresence";
    tasklamp_presence_plugload_icon.src = "/static/Images/Task Lamp ON.png"
    tasklampDropdown.childNodes[1].value = "5 minutes"
  } else {
    tasklamppresence.className = "redPresence";
    tasklamp_presence_plugload_icon.src = "/static/Images/Task Lamp OFF.png";
    tasklampDropdown.childNodes[1].value = "off"
  }
}

// Turning presence control on or off for Fan
var fanDropdown = document.getElementById("Fandropdown");
fanpresence.onclick = function() {
  if (fanpresence.className === "redPresence") {
    fanpresence.className = "greenPresence";
    fan_presence_plugload_icon.src = "/static/Images/Fan ON.png"
    fanDropdown.childNodes[1].value = "5 minutes"
  } else {
    fanpresence.className = "redPresence";
    fan_presence_plugload_icon.src = "/static/Images/Fan OFF.png"
    fanDropdown.childNodes[1].value = "off"
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