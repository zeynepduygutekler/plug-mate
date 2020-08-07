// This is the Wednesday (2017-12-20) calendar.

import React, { Component } from "react";
import ReactDOM, { render } from 'react-dom'
import moment from 'moment'
import Scheduler, {
  SchedulerData,
  ViewTypes
} from "react-big-scheduler";
import DemoData from './Data.js';
import withDragDropContext from "./withDnDContext";
import "react-big-scheduler/lib/css/style.css";
import Timepicker from './Timepicker';
import Radio from './Radio'
import Checkbox from './Checkbox'
import './styles.css'

class Basic extends Component {
  constructor(props) {
    super(props);

    let schedulerData = new SchedulerData(
      "2017-12-20",
      ViewTypes.Day,
      false,
      false,
      {
        checkConflict: true,
        recurringEventsEnabled: true,
        scrollToSpecialMomentEnabled: true,
        crossResourceMove: false
      }, {
        getScrollSpecialMomentFunc: this.getScrollSpecialMoment,
        isNonWorkingTimeFunc: this.isNonWorkingTime
      }
    );
    // schedulerData.localeMoment.locale('en');
    schedulerData.setResources(DemoData.resources);
    schedulerData.setEvents(DemoData.events);
    this.state = {
      viewModel: schedulerData
    };
    window.wednesdayCalendar = this
  }
  render() {
    const { viewModel } = this.state;
    return (
      <div>
        <div>
          <Scheduler
            schedulerData={viewModel}
            eventItemClick={this.eventClicked}
            updateEventStart={this.updateEventStart}
            updateEventEnd={this.updateEventEnd}
            moveEvent={this.moveEvent}
            newEvent={this.newEvent}
            conflictOccurred={this.conflictOccurred}
          />
        </div>
      </div>
    );
  }

  // Set the whole day as "NonWorkingTime", so that grey colour is consistent
  isNonWorkingTime = (schedulerData, time) => {
    return true;
  }

  // Automatic scroll to 7 AM
  getScrollSpecialMoment = (schedulerData, startMoment, endMoment) => {
    return moment("2017-12-20 07:00:00");
  }

  // Function for when event is clicked
  eventClicked = (schedulerData, event) => {
    function okButtonClicked() {
      // Update schedule name
      var schedule = document.getElementById("schedule_name").value;
      var start = document.getElementById("start").value;
      var end = document.getElementById("end").value;

      var formattedstart = ""
      if (start.length === 7) {
        formattedstart = "0" + start;
      } else {
        formattedstart = start;
      }
      var formattedend = ""
      if (end.length === 7) {
        formattedend = "0" + end;
      } else {
        formattedend = end;
      }

      // Update start time
      if (start.length === 7) {
        start = "0" + start;
      }
      if (start.includes("AM")) {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 00" + start.substring(2, 5) + ":00"
        } else {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        }
      } else {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        } else {
          start = "2017-12-20 " + (Number(start.substring(0, 2)) + 12).toString() + start.substring(2, 5) + ":00"
        }
      }

      // Update end time

      if (end.length === 7) {
        end = "0" + end;
      }
      if (end.includes("AM")) {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-21 00" + end.substring(2, 5) + ":00"
        } else {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        }
      } else {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        } else {
          end = "2017-12-20 " + (Number(end.substring(0, 2)) + 12).toString() + end.substring(2, 5) + ":00"
        }
      }

      // Checking conflicts
      var hasConflict = false;
      var conflictedEvents = [];
      var plugload_option = document.querySelectorAll('input[name="Plug Loads"]:checked');
      var repeat_option = document.querySelector('input[name="Repeat:"]:checked').value;
      var days_to_loop_over = ["2017-12-20"]
      if (repeat_option === "Every Day") {
        days_to_loop_over = ['2017-12-18', '2017-12-19', '2017-12-20', '2017-12-21', '2017-12-22', '2017-12-23', '2017-12-24']
      }

      schedulerData.events.forEach(function(e) {
        var eStart = e.start;
        var eEnd = e.end;
        var start_for_this = ""
        var end_for_this = ""
        for (var day of days_to_loop_over) {
                    start_for_this = day + start.substring(10, 19)
            end_for_this = day + end.substring(10, 19)
          if (e.resourceId === event.resourceId) {
            if (((start_for_this >= eStart && start_for_this < eEnd) ||
                (end_for_this > eStart && end_for_this <= eEnd) ||
                (eStart >= start_for_this && eStart < end_for_this) ||
                (eEnd > start_for_this && eEnd <= end_for_this)) && (e.id !== event.id)) {
                  hasConflict = true;
                  conflictedEvents.push(e);
                }
          }
          for (var plugload of plugload_option) {
            if (e.resourceId === plugload.value) {
              if ((start_for_this >= eStart && start_for_this < eEnd) ||
                  (end_for_this > eStart && end_for_this <= eEnd) ||
                  (eStart >= start_for_this && eStart < end_for_this) ||
                  (eEnd > start_for_this && eEnd <= end_for_this)) {
                    hasConflict = true;
                    conflictedEvents.push(e);
                  }
            }
          }
        }
      })

      // If there is a conflict, show alert and do nothing. Otherwise, update calendar.
      if (hasConflict) {
        var message = "Conflict occurred for the following events:" // Change this message accordingly
        var day = ""
        for (var events of conflictedEvents) {
          if (event.start.toString().includes("2017-12-18")) {
            day = "Monday"
          }
          if (event.start.toString().includes("2017-12-19")) {
            day = "Tuesday"
          }
          if (event.start.toString().includes("2017-12-20")) {
            day = "Wednesday"
          }
          if (event.start.toString().includes("2017-12-21")) {
            day = "Thursday"
          }
          if (event.start.toString().includes("2017-12-22")) {
            day = "Friday"
          }
          if (event.start.toString().includes("2017-12-23")) {
            day = "Saturday"
          }
          if (event.start.toString().includes("2017-12-24")) {
            day = "Sunday"
          }
          var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
          message += `\n- ${events.title} for ${current_plugload_conflicted} on ${day}`
        }
        alert(message)
      } else {
        event.title = schedule + " (" + formattedstart + " - " + formattedend + ")";
        schedulerData.updateEventStart(event, start);
        schedulerData.updateEventEnd(event, end);

        var rrule = ""
        if (repeat_option === "Every Day") {
          var updatedstart = "2017-12-18" + start.substring(10, 19)
          schedulerData.updateEventStart(event, updatedstart)
          var updatedend = "2017-12-18" + end.substring(10, 19)
          schedulerData.updateEventEnd(event, updatedend)
          event.rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          setTimeout(function() {document.getElementById("WednesdayCalendar").click();},1)
        } else {
            if (event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z") {
          var name = event.title;
          var new_start = event.start
          var new_end = event.end
          var new_slot = event.resourceId
          schedulerData.removeEvent(event);
          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title:  name,
            start: new_start,
            end: new_end,
            resourceId: new_slot,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: ""
          };
          schedulerData.addEvent(newEvent);
          DemoData.events = schedulerData.events
          setTimeout(function(){document.getElementById("WednesdayCalendar").click();},1)
        }}
        for (var plugload of plugload_option) {

          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title: event.title,
            start: moment(start),
            end: moment(end),
            resourceId: plugload.value,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: rrule
          };
          schedulerData.addEvent(newEvent);
          DemoData.events = schedulerData.events;
        }

        if (start >= end || end <= start) {
          alert("Check your timings! Start time should be before end time.")
        } else {
          // Update displayed calendar
          DemoData.events = schedulerData.events;
          window.wednesdayCalendar.setState({
            viewModel: schedulerData
          })
      }

        // Remove popup
        ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
      }
    }
    function closeButtonClicked() {
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))
    }

    function deleteButtonClicked() {
      schedulerData.removeEvent(event)
      DemoData.events = schedulerData.events
      window.wednesdayCalendar.setState({
        viewModel: schedulerData
      })
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
    }

    var resourceName = schedulerData.getSlotById(event.resourceId).name
    render(<>
              <div className="cover" id="cover"></div>
              <div className="containerpopup" id="schedule_popup">
                <input id="schedule_name" type="text" name="title" defaultValue={event.title.substring(0, event.title.length - 22)} />
                <button id="close_button" style={{float:"right"}} onClick={closeButtonClicked}>x</button>
                <Timepicker defaultStart={moment(event.start)} defaultEnd={moment(event.end)} />
                {event.rrule === "" && <Radio name="Repeat:" day="Wednesday" default="Every Week" />}
                {event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z" && <Radio name="Repeat:" day="Wednesday" default="Every Day" />}
                {(resourceName === "Desktop") && <Checkbox
                  name="Plug Loads"
                  option1="Monitor"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Monitor") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Laptop") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Task Lamp") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Fan"
                />}

                {(resourceName === "Fan") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Task Lamp"
                />}
                <br />
                <br />
                <div style={{textAlign:"center"}}>
                  <button onClick={deleteButtonClicked} style={{color:"white", background:"#e74a3b"}}> Delete </button>
                  <button onClick={okButtonClicked} style={{color:"white", background:"#1cc88a", marginLeft:"5px"}}> OK </button>
                </div>
              </div>
          </>, document.getElementById("popup-container-schedule"));
  };

  // Function for when a new event is created by dragging
  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    let newFreshId = 0;
    schedulerData.events.forEach(item => {
      if (item.id >= newFreshId) newFreshId = item.id + 1;
    });

    let newEvent = {
      id: newFreshId,
      title: "(no name) (" + moment(start).format("hh:mm A") + " - " + moment(end).format("hh:mm A") + ")",
      start: start,
      end: end,
      resourceId: slotId,
      bgColor: "#06D6A0",
      showPopover: false,
      rrule: ""
    };
    //schedulerData.addEvent(newEvent);
    //DemoData.events = schedulerData.events


    function okButtonClicked() {
      // Update schedule name
      var schedule = document.getElementById("schedule_name").value;
      var start = document.getElementById("start").value;
      var end = document.getElementById("end").value;

      var formattedstart = ""
      if (start.length === 7) {
        formattedstart = "0" + start;
      } else {
        formattedstart = start;
      }
      var formattedend = ""
      if (end.length === 7) {
        formattedend = "0" + end;
      } else {
        formattedend = end;
      }

      // Update start time

      if (start.length === 7) {
        start = "0" + start;
      }
      if (start.includes("AM")) {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 00" + start.substring(2, 5) + ":00"
        } else {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        }
      } else {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        } else {
          start = "2017-12-20 " + (Number(start.substring(0, 2)) + 12).toString() + start.substring(2, 5) + ":00"
        }
      }


      // Update end time

      if (end.length === 7) {
        end = "0" + end;
      }
      if (end.includes("AM")) {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-21 00" + end.substring(2, 5) + ":00"
        } else {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        }
      } else {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        } else {
          end = "2017-12-20 " + (Number(end.substring(0, 2)) + 12).toString() + end.substring(2, 5) + ":00"
        }
      }

      // Checking conflicts
      var hasConflict = false;
      var conflictedEvents = [];
      var plugload_option = document.querySelectorAll('input[name="Plug Loads"]:checked');
      var repeat_option = document.querySelector('input[name="Repeat:"]:checked').value;
      var days_to_loop_over = ["2017-12-20"]
      if (repeat_option === "Every Day") {
        days_to_loop_over = ['2017-12-18', '2017-12-19', '2017-12-20', '2017-12-21', '2017-12-22', '2017-12-23', '2017-12-24']
      }

      schedulerData.events.forEach(function(e) {
        var eStart = e.start;
        var eEnd = e.end;
        var start_for_this = ""
        var end_for_this = ""
        for (var day of days_to_loop_over) {
                    start_for_this = day + start.substring(10, 19)
            end_for_this = day + end.substring(10, 19)
          if (e.resourceId === newEvent.resourceId) {
            if (((start_for_this >= eStart && start_for_this < eEnd) ||
                (end_for_this > eStart && end_for_this <= eEnd) ||
                (eStart >= start_for_this && eStart < end_for_this) ||
                (eEnd > start_for_this && eEnd <= end_for_this)) && (e.id !== newEvent.id)) {
                  hasConflict = true;
                  conflictedEvents.push(e)
                }
          }
          for (var plugload of plugload_option) {
            if (e.resourceId === plugload.value) {
              if ((start_for_this >= eStart && start_for_this < eEnd) ||
                  (end_for_this > eStart && end_for_this <= eEnd) ||
                  (eStart >= start_for_this && eStart < end_for_this) ||
                  (eEnd > start_for_this && eEnd <= end_for_this)) {
                    hasConflict = true;
                    conflictedEvents.push(e);
                  }
            }
          }
        }
      })

      // If there is a conflict, show alert and do nothing.
      if (hasConflict) {
        var message = "Conflict occurred for the following events:" // Change this message accordingly
        var day = ""
        for (var events of conflictedEvents) {
          if (newEvent.start.toString().includes("2017-12-18")) {
            day = "Monday"
          }
          if (newEvent.start.toString().includes("2017-12-19")) {
            day = "Tuesday"
          }
          if (newEvent.start.toString().includes("2017-12-20")) {
            day = "Wednesday"
          }
          if (newEvent.start.toString().includes("2017-12-21")) {
            day = "Thursday"
          }
          if (newEvent.start.toString().includes("2017-12-22")) {
            day = "Friday"
          }
          if (newEvent.start.toString().includes("2017-12-23")) {
            day = "Saturday"
          }
          if (newEvent.start.toString().includes("2017-12-24")) {
            day = "Sunday"
          }
          var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
          message += `\n- ${events.title} for ${current_plugload_conflicted} on ${day}`
        }
        alert(message)
      } else {
        newEvent.title = schedule + " (" + formattedstart + " - " + formattedend + ")";
        schedulerData.updateEventStart(newEvent, start);
        schedulerData.updateEventEnd(newEvent, end);

        var rrule = ""
        if (repeat_option === "Every Day") {
          var updatedstart = "2017-12-18" + start.substring(10, 19)
          schedulerData.updateEventStart(newEvent, updatedstart)
          var updatedend = "2017-12-18" + end.substring(10, 19)
          schedulerData.updateEventEnd(newEvent, updatedend)
          newEvent.rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          setTimeout(function() {document.getElementById("WednesdayCalendar").click();},1)
        } else {
            if (newEvent.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z") {
          var name = newEvent.title;
          var new_start = newEvent.start
          var new_end = newEvent.end
          var new_slot = newEvent.resourceId
          schedulerData.removeEvent(newEvent);
          let anotherFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= anotherFreshId) anotherFreshId = item.id + 1;
          });

          let anotherNewEvent = {
            id: anotherFreshId,
            title:  name,
            start: new_start,
            end: new_end,
            resourceId: new_slot,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: ""
          };
          schedulerData.addEvent(anotherNewEvent);
          DemoData.events = schedulerData.events
          setTimeout(function(){document.getElementById("WednesdayCalendar").click();},1)
        }}

        for (var plugload of plugload_option) {

          let newFreshId_plugload = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId_plugload) newFreshId_plugload = item.id + 1;
          });

          let newEvent_plugload = {
            id: newFreshId_plugload,
            title: newEvent.title,
            start: moment(start),
            end: moment(end),
            resourceId: plugload.value,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: rrule
          };
          schedulerData.addEvent(newEvent_plugload); // Check why new event disappears
          DemoData.events = schedulerData.events
        }

        if (start >= end || end <= start) {
          alert("Check your timings! Start time should be before end time.")
        } else {
          // Update displayed calendar
          DemoData.events = schedulerData.events;
          window.wednesdayCalendar.setState({
            viewModel: schedulerData
          })
      }

        // Remove popup
        ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
      }
    }

    function closeButtonClicked() {
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))
    }

    function deleteButtonClicked() {
      schedulerData.removeEvent(newEvent)
      DemoData.events = schedulerData.events
      window.wednesdayCalendar.setState({
        viewModel: schedulerData
      })
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
    }

    var resourceName = schedulerData.getSlotById(newEvent.resourceId).name
    render(<>
              <div className="cover" id="cover"></div>
              <div className="containerpopup" id="schedule_popup">
                <input id="schedule_name" type="text" name="title" defaultValue={newEvent.title.substring(0, newEvent.title.length-22)} />
                <button id="close_button" style={{float:"right"}} onClick={closeButtonClicked}>x</button>
                <Timepicker defaultStart={moment(newEvent.start)} defaultEnd={moment(newEvent.end)} />
                {newEvent.rrule === "" && <Radio name="Repeat:" day="Wednesday" default="Every Week" />}
                {newEvent.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z" && <Radio name="Repeat:" day="Wednesday" default="Every Day" />}
                {(resourceName === "Desktop") && <Checkbox
                  name="Plug Loads"
                  option1="Monitor"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Monitor") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Laptop") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Task Lamp") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Fan"
                />}

                {(resourceName === "Fan") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Task Lamp"
                />}
                <br />
                <br />
                <div style={{textAlign:"center"}}>
                  <button onClick={deleteButtonClicked} style={{color:"white", background:"#e74a3b"}}> Delete </button>
                  <button onClick={okButtonClicked} style={{color:"white", background:"#1cc88a", marginLeft:"5px"}}> OK </button>
                </div>
              </div>
          </>, document.getElementById("popup-container-schedule"));
  };

  // Function for when the start time is changed by dragging
  updateEventStart = (schedulerData, event, newStart) => {
    function okButtonClicked() {
      // Update schedule name
      var schedule = document.getElementById("schedule_name").value;
      var start = document.getElementById("start").value;
      var end = document.getElementById("end").value;

      var formattedstart = ""
      if (start.length === 7) {
        formattedstart = "0" + start;
      } else {
        formattedstart = start;
      }
      var formattedend = ""
      if (end.length === 7) {
        formattedend = "0" + end;
      } else {
        formattedend = end;
      }

      // Update start time

      if (start.length === 7) {
        start = "0" + start;
      }
      if (start.includes("AM")) {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 00" + start.substring(2, 5) + ":00"
        } else {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        }
      } else {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        } else {
          start = "2017-12-20 " + (Number(start.substring(0, 2)) + 12).toString() + start.substring(2, 5) + ":00"
        }
      }


      // Update end time

      if (end.length === 7) {
        end = "0" + end;
      }
      if (end.includes("AM")) {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-21 00" + end.substring(2, 5) + ":00"
        } else {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        }
      } else {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        } else {
          end = "2017-12-20 " + (Number(end.substring(0, 2)) + 12).toString() + end.substring(2, 5) + ":00"
        }
      }

      // Checking conflicts
      var hasConflict = false;
      var conflictedEvents = [];
      var plugload_option = document.querySelectorAll('input[name="Plug Loads"]:checked');
      var repeat_option = document.querySelector('input[name="Repeat:"]:checked').value;
      var days_to_loop_over = ["2017-12-20"]
      if (repeat_option === "Every Day") {
        days_to_loop_over = ['2017-12-18', '2017-12-19', '2017-12-20', '2017-12-21', '2017-12-22', '2017-12-23', '2017-12-24']
      }

      schedulerData.events.forEach(function(e) {
        var eStart = e.start;
        var eEnd = e.end;
        var start_for_this = ""
        var end_for_this = ""
        for (var day of days_to_loop_over) {
                    start_for_this = day + start.substring(10, 19)
            end_for_this = day + end.substring(10, 19)
          if (e.resourceId === event.resourceId) {
            if (((start_for_this >= eStart && start_for_this < eEnd) ||
                (end_for_this > eStart && end_for_this <= eEnd) ||
                (eStart >= start_for_this && eStart < end_for_this) ||
                (eEnd > start_for_this && eEnd <= end_for_this)) && (e.id !== event.id)) {
                  hasConflict = true;
                  conflictedEvents.push(e)
                }
          }
          for (var plugload of plugload_option) {
            if (e.resourceId === plugload.value) {
              if ((start_for_this >= eStart && start_for_this < eEnd) ||
                  (end_for_this > eStart && end_for_this <= eEnd) ||
                  (eStart >= start_for_this && eStart < end_for_this) ||
                  (eEnd > start_for_this && eEnd <= end_for_this)) {
                    hasConflict = true;
                    conflictedEvents.push(e);
                  }
            }
          }
        }
      })

      // If there is a conflict, show alert and do nothing.
      if (hasConflict) {
        var message = "Conflict occurred for the following events:" // Change this message accordingly
        var day = ""
        for (var events of conflictedEvents) {
          if (event.start.toString().includes("2017-12-18")) {
            day = "Monday"
          }
          if (event.start.toString().includes("2017-12-19")) {
            day = "Tuesday"
          }
          if (event.start.toString().includes("2017-12-20")) {
            day = "Wednesday"
          }
          if (event.start.toString().includes("2017-12-21")) {
            day = "Thursday"
          }
          if (event.start.toString().includes("2017-12-22")) {
            day = "Friday"
          }
          if (event.start.toString().includes("2017-12-23")) {
            day = "Saturday"
          }
          if (event.start.toString().includes("2017-12-24")) {
            day = "Sunday"
          }
          var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
          message += `\n- ${events.title} for ${current_plugload_conflicted} on ${day}`
        }
        alert(message)
      } else {
        event.title = schedule + " (" + formattedstart + " - " +formattedend + ")";
        schedulerData.updateEventStart(event, start);
        schedulerData.updateEventEnd(event, end);

        var rrule = ""
        if (repeat_option === "Every Day") {
          var updatedstart = "2017-12-18" + start.substring(10, 19)
          schedulerData.updateEventStart(event, updatedstart)
          var updatedend = "2017-12-18" + end.substring(10, 19)
          schedulerData.updateEventEnd(event, updatedend)
          event.rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          setTimeout(function() {document.getElementById("WednesdayCalendar").click();},1)
        } else {
            if (event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z") {
          var name = event.title;
          var new_start = event.start
          var new_end = event.end
          var new_slot = event.resourceId
          schedulerData.removeEvent(event);
          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title:  name,
            start: new_start,
            end: new_end,
            resourceId: new_slot,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: ""
          };
          schedulerData.addEvent(newEvent);
          DemoData.events = schedulerData.events
          setTimeout(function(){document.getElementById("WednesdayCalendar").click();},1)
        }}

        for (var plugload of plugload_option) {

          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title: event.title,
            start: moment(start),
            end: moment(end),
            resourceId: plugload.value,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: rrule
          };

          schedulerData.addEvent(newEvent); // Check why new event disappears
          DemoData.events = schedulerData.events
        }

        if (start >= end || end <= start) {
          alert("Check your timings! Start time should be before end time.")
        } else {
          // Update displayed calendar
          DemoData.events = schedulerData.events;
          window.wednesdayCalendar.setState({
            viewModel: schedulerData
          })

      }

        // Remove popup
        ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
      }
    }

    function closeButtonClicked() {
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))
    }

    function deleteButtonClicked() {
      schedulerData.removeEvent(event);
      DemoData.events = schedulerData.events;
      window.wednesdayCalendar.setState({
        viewModel: schedulerData
      })
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
    }
    var resourceName = schedulerData.getSlotById(event.resourceId).name
    render(<>
              <div className="cover" id="cover"></div>
              <div className="containerpopup" id="schedule_popup">
                <input id="schedule_name" type="text" name="title" defaultValue={event.title.substring(0, event.title.length-22)} />
                <button id="close_button" style={{float:"right"}} onClick={closeButtonClicked}>x</button>
                <Timepicker defaultStart={moment(newStart)} defaultEnd={moment(event.end)} />
                {event.rrule === "" && <Radio name="Repeat:" day="Wednesday" default="Every Week" />}
                {event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z" && <Radio name="Repeat:" day="Wednesday" default="Every Day" />}
                {(resourceName === "Desktop") && <Checkbox
                  name="Plug Loads"
                  option1="Monitor"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Monitor") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Laptop") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Task Lamp") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Fan"
                />}

                {(resourceName === "Fan") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Task Lamp"
                />}
                <br />
                <br />
                <div style={{textAlign:"center"}}>
                  <button onClick={deleteButtonClicked} style={{color:"white", background:"#e74a3b"}}> Delete </button>
                  <button onClick={okButtonClicked} style={{color:"white", background:"#1cc88a", marginLeft:"5px"}}> OK </button>
                </div>
              </div>
          </>, document.getElementById("popup-container-schedule"));
  };

  // Function for when the end time is changed by dragging
  updateEventEnd = (schedulerData, event, newEnd) => {
    function okButtonClicked() {
      // Update schedule name
      var schedule = document.getElementById("schedule_name").value;
      var start = document.getElementById("start").value;
      var end = document.getElementById("end").value;

      var formattedstart = ""
      if (start.length === 7) {
        formattedstart = "0" + start;
      } else {
        formattedstart = start;
      }
      var formattedend = ""
      if (end.length === 7) {
        formattedend = "0" + end;
      } else {
        formattedend = end;
      }

      // Update start time
      if (start.length === 7) {
        start = "0" + start;
      }
      if (start.includes("AM")) {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 00" + start.substring(2, 5) + ":00"
        } else {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        }
      } else {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        } else {
          start = "2017-12-20 " + (Number(start.substring(0, 2)) + 12).toString() + start.substring(2, 5) + ":00"
        }
      }


      // Update end time
      if (end.length === 7) {
        end = "0" + end;
      }
      if (end.includes("AM")) {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-21 00" + end.substring(2, 5) + ":00"
        } else {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        }
      } else {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        } else {
          end = "2017-12-20 " + (Number(end.substring(0, 2)) + 12).toString() + end.substring(2, 5) + ":00"
        }
      }
      // Checking conflicts
      var hasConflict = false;
      var conflictedEvents = [];
      var plugload_option = document.querySelectorAll('input[name="Plug Loads"]:checked');
      var repeat_option = document.querySelector('input[name="Repeat:"]:checked').value;
      var days_to_loop_over = ["2017-12-20"]
      if (repeat_option === "Every Day") {
        days_to_loop_over = ['2017-12-18', '2017-12-19', '2017-12-20', '2017-12-21', '2017-12-22', '2017-12-23', '2017-12-24']
      }

      schedulerData.events.forEach(function(e) {
        var eStart = e.start;
        var eEnd = e.end;
        var start_for_this = ""
        var end_for_this = ""
        for (var day of days_to_loop_over) {
                    start_for_this = day + start.substring(10, 19)
            end_for_this = day + end.substring(10, 19)
          if (e.resourceId === event.resourceId) {
            if (((start_for_this >= eStart && start_for_this < eEnd) ||
                (end_for_this > eStart && end_for_this <= eEnd) ||
                (eStart >= start_for_this && eStart < end_for_this) ||
                (eEnd > start_for_this && eEnd <= end_for_this)) && (e.id !== event.id)) {
                  hasConflict = true;
                  conflictedEvents.push(e)
                }
          }
          for (var plugload of plugload_option) {
            if (e.resourceId === plugload.value) {
              if ((start_for_this >= eStart && start_for_this < eEnd) ||
                  (end_for_this > eStart && end_for_this <= eEnd) ||
                  (eStart >= start_for_this && eStart < end_for_this) ||
                  (eEnd > start_for_this && eEnd <= end_for_this)) {
                    hasConflict = true;
                    conflictedEvents.push(e)
                  }
            }
          }
        }
      })

      // If there is a conflict, show alert and do nothing.
      if (hasConflict) {
        var message = "Conflict occurred for the following events:" // Change this message accordingly
        var day = ""
        for (var events of conflictedEvents) {
          if (event.start.toString().includes("2017-12-18")) {
            day = "Monday"
          }
          if (event.start.toString().includes("2017-12-19")) {
            day = "Tuesday"
          }
          if (event.start.toString().includes("2017-12-20")) {
            day = "Wednesday"
          }
          if (event.start.toString().includes("2017-12-21")) {
            day = "Thursday"
          }
          if (event.start.toString().includes("2017-12-22")) {
            day = "Friday"
          }
          if (event.start.toString().includes("2017-12-23")) {
            day = "Saturday"
          }
          if (event.start.toString().includes("2017-12-24")) {
            day = "Sunday"
          }
          var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
          message += `\n- ${events.title} for ${current_plugload_conflicted} on ${day}`
        }
        alert(message)
      } else {
        event.title = schedule + " (" + formattedstart + " - " +formattedend + ")";
        schedulerData.updateEventStart(event, start);
        schedulerData.updateEventEnd(event, end);

        var rrule = ""
        if (repeat_option === "Every Day") {
          var updatedstart = "2017-12-18" + start.substring(10, 19)
          schedulerData.updateEventStart(event, updatedstart)
          var updatedend = "2017-12-18" + end.substring(10, 19)
          schedulerData.updateEventEnd(event, updatedend)
          event.rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          setTimeout(function() {document.getElementById("WednesdayCalendar").click();},1)
        } else {
            if (event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z") {
          var name = event.title;
          var new_start = event.start
          var new_end = event.end
          var new_slot = event.resourceId
          schedulerData.removeEvent(event);
          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title:  name,
            start: new_start,
            end: new_end,
            resourceId: new_slot,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: ""
          };
          schedulerData.addEvent(newEvent);
          DemoData.events = schedulerData.events
          setTimeout(function(){document.getElementById("WednesdayCalendar").click();},1)
        }}

        for (var plugload of plugload_option) {

          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title: event.title,
            start: moment(start),
            end: moment(end),
            resourceId: plugload.value,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: rrule
          };

          schedulerData.addEvent(newEvent); // Check why new event disappears
          DemoData.events = schedulerData.events
        }

        if (start >= end || end <= start) {
          alert("Check your timings! Start time should be before end time.")
        } else {
          // Update displayed calendar
          DemoData.events = schedulerData.events;
          window.wednesdayCalendar.setState({
            viewModel: schedulerData
          })
      }

        // Remove popup
        ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
      }
    }

    function closeButtonClicked() {
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
    }

    function deleteButtonClicked() {
      schedulerData.removeEvent(event)
      DemoData.events = schedulerData.events
      window.wednesdayCalendar.setState({
        viewModel: schedulerData
      })
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
    }
    var resourceName = schedulerData.getSlotById(event.resourceId).name
    render(<>
              <div className="cover" id="cover"></div>
              <div className="containerpopup" id="schedule_popup">
                <input id="schedule_name" type="text" name="title" defaultValue={event.title.substring(0, event.title.length-22)} />
                <button id="close_button" style={{float:"right"}} onClick={closeButtonClicked}>x</button>
                <Timepicker defaultStart={moment(event.start)} defaultEnd={moment(newEnd)} />
                {event.rrule === "" && <Radio name="Repeat:" day="Wednesday" default="Every Week" />}
                {event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z" && <Radio name="Repeat:" day="Wednesday" default="Every Day" />}
                {(resourceName === "Desktop") && <Checkbox
                  name="Plug Loads"
                  option1="Monitor"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Monitor") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Laptop") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Task Lamp") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Fan"
                />}

                {(resourceName === "Fan") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Task Lamp"
                />}
                <br />
                <br />
                <div style={{textAlign:"center"}}>
                  <button onClick={deleteButtonClicked} style={{color:"white", background:"#e74a3b"}}> Delete </button>
                  <button onClick={okButtonClicked} style={{color:"white", background:"#1cc88a", marginLeft:"5px"}}> OK </button>
                </div>
              </div>
          </>, document.getElementById("popup-container-schedule"));
  };

  // Function for when the event is moved by dragging
  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    schedulerData.updateEventStart(event, start);
    schedulerData.updateEventEnd(event, end);
    event.title = event.title.substring(0,event.title.length-20) + moment(start).format('HH:mm A') + " - " + moment(end).format('HH:mm A') + ")"
    this.setState({
        viewModel: schedulerData
    })
    function okButtonClicked() {
      // Update schedule name
      var schedule = document.getElementById("schedule_name").value;
      var start = document.getElementById("start").value;
      var end = document.getElementById("end").value;

      var formattedstart = ""
      if (start.length === 7) {
        formattedstart = "0" + start;
      } else {
        formattedstart = start;
      }
      var formattedend = ""
      if (end.length === 7) {
        formattedend = "0" + end;
      } else {
        formattedend = end;
      }


      // Update start time
      if (start.length === 7) {
        start = "0" + start;
      }
      if (start.includes("AM")) {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 00" + start.substring(2, 5) + ":00"
        } else {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        }
      } else {
        if (start.substring(0, 2) === "12") {
          start = "2017-12-20 " + start.substring(0, 5) + ":00"
        } else {
          start = "2017-12-20 " + (Number(start.substring(0, 2)) + 12).toString() + start.substring(2, 5) + ":00"
        }
      }


      // Update end time
      if (end.length === 7) {
        end = "0" + end;
      }
      if (end.includes("AM")) {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-21 00" + end.substring(2, 5) + ":00"
        } else {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        }
      } else {
        if (end.substring(0, 2) === "12") {
          end = "2017-12-20 " + end.substring(0, 5) + ":00"
        } else {
          end = "2017-12-20 " + (Number(end.substring(0, 2)) + 12).toString() + end.substring(2, 5) + ":00"
        }
      }

      // Checking conflicts
      var hasConflict = false;
      var conflictedEvents = [];
      var plugload_option = document.querySelectorAll('input[name="Plug Loads"]:checked');
      var repeat_option = document.querySelector('input[name="Repeat:"]:checked').value;
      var days_to_loop_over = ["2017-12-20"]
      if (repeat_option === "Every Day") {
        days_to_loop_over = ['2017-12-18', '2017-12-19', '2017-12-20', '2017-12-21', '2017-12-22', '2017-12-23', '2017-12-24']
      }

      schedulerData.events.forEach(function(e) {
        var eStart = e.start;
        var eEnd = e.end;
        var start_for_this = ""
        var end_for_this = ""
        for (var day of days_to_loop_over) {
                    start_for_this = day + start.substring(10, 19)
            end_for_this = day + end.substring(10, 19)
          if (e.resourceId === event.resourceId) {
            if (((start_for_this >= eStart && start_for_this < eEnd) ||
                (end_for_this > eStart && end_for_this <= eEnd) ||
                (eStart >= start_for_this && eStart < end_for_this) ||
                (eEnd > start_for_this && eEnd <= end_for_this)) && (e.id !== event.id)) {
                  hasConflict = true;
                  conflictedEvents.push(e)
                }
          }
          for (var plugload of plugload_option) {
            if (e.resourceId === plugload.value) {
              if ((start_for_this >= eStart && start_for_this < eEnd) ||
                  (end_for_this > eStart && end_for_this <= eEnd) ||
                  (eStart >= start_for_this && eStart < end_for_this) ||
                  (eEnd > start_for_this && eEnd <= end_for_this)) {
                    hasConflict = true;
                    conflictedEvents.push(e)
                  }
            }
          }
        }
      })

      // If there is a conflict, show alert and do nothing.
      if (hasConflict) {
        var message = "Conflict occurred for the following events:" // Change this message accordingly
        var day = ""
        for (var events of conflictedEvents) {
          if (event.start.toString().includes("2017-12-18")) {
            day = "Monday"
          }
          if (event.start.toString().includes("2017-12-19")) {
            day = "Tuesday"
          }
          if (event.start.toString().includes("2017-12-20")) {
            day = "Wednesday"
          }
          if (event.start.toString().includes("2017-12-21")) {
            day = "Thursday"
          }
          if (event.start.toString().includes("2017-12-22")) {
            day = "Friday"
          }
          if (event.start.toString().includes("2017-12-23")) {
            day = "Saturday"
          }
          if (event.start.toString().includes("2017-12-24")) {
            day = "Sunday"
          }
          var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
          message += `\n- ${events.title} for ${current_plugload_conflicted} on ${day}`
        }
        alert(message)
      } else {
        event.title = schedule + " (" + formattedstart + " - " +formattedend + ")";

        schedulerData.updateEventStart(event, start);
        schedulerData.updateEventEnd(event, end);

        var rrule = ""
        if (repeat_option === "Every Day") {
          var updatedstart = "2017-12-18" + start.substring(10, 19)
          schedulerData.updateEventStart(event, updatedstart)
          var updatedend = "2017-12-18" + end.substring(10, 19)
          schedulerData.updateEventEnd(event, updatedend)
          event.rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          rrule="FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z"
          setTimeout(function() {document.getElementById("WednesdayCalendar").click();},1)
        } else {
            if (event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z") {
          var name = event.title;
          var new_start = event.start
          var new_end = event.end
          var new_slot = event.resourceId
          schedulerData.removeEvent(event);
          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title:  name,
            start: new_start,
            end: new_end,
            resourceId: new_slot,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: ""
          };
          schedulerData.addEvent(newEvent);
          DemoData.events = schedulerData.events
          setTimeout(function(){document.getElementById("WednesdayCalendar").click();},1)
        }}

        for (var plugload of plugload_option) {

          let newFreshId = 0;
          schedulerData.events.forEach(item => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
          });

          let newEvent = {
            id: newFreshId,
            title: event.title,
            start: moment(start),
            end: moment(end),
            resourceId: plugload.value,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: rrule
          };

          schedulerData.addEvent(newEvent); // Check why new event disappears
          DemoData.events = schedulerData.events
        }

        if (start >= end || end <= start) {
          alert("Check your timings! Start time should be before end time.")
        } else {
          // Update displayed calendar
          DemoData.events = schedulerData.events;
          window.wednesdayCalendar.setState({
            viewModel: schedulerData
          })

      }


        // Remove popup
        ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
      }
    }
    function closeButtonClicked() {
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"))
    }
    function deleteButtonClicked() {
      schedulerData.removeEvent(event)
      DemoData.events = schedulerData.events
      window.wednesdayCalendar.setState({
        viewModel: schedulerData
      })
      ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
    }
    var resourceName = schedulerData.getSlotById(event.resourceId).name
    render(<>
              <div classname="cover" id="cover"></div>
              <div className="containerpopup" id="schedule_popup">
                <input id="schedule_name" type="text" name="title" defaultValue={event.title.substring(0, event.title.length - 22)} />
                <button id="close_button" style={{float:"right"}} onClick={closeButtonClicked}>x</button>
                <Timepicker defaultStart={moment(start)} defaultEnd={moment(end)} />
                {event.rrule === "" && <Radio name="Repeat:" day="Wednesday" default="Every Week" />}
                {event.rrule === "FREQ=DAILY;DTSTART=20171218T000000Z;UNTIL=20171224T235900Z" && <Radio name="Repeat:" day="Wednesday" default="Every Day" />}
                {(resourceName === "Desktop") && <Checkbox
                  name="Plug Loads"
                  option1="Monitor"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Monitor") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Laptop"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Laptop") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Task Lamp"
                  option4="Fan"
                />}

                {(resourceName === "Task Lamp") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Fan"
                />}

                {(resourceName === "Fan") && <Checkbox
                  name="Plug Loads"
                  option1="Desktop"
                  option2="Monitor"
                  option3="Laptop"
                  option4="Task Lamp"
                />}
                <br />
                <br />
                <div style={{textAlign:"center"}}>
                  <button onClick={deleteButtonClicked} style={{color:"white", background:"#e74a3b"}}> Delete </button>
                  <button onClick={okButtonClicked} style={{color:"white", background:"#1cc88a", marginLeft:"5px"}}> OK </button>
                </div>
              </div>
          </>, document.getElementById("popup-container-schedule"));
  };

  // When a conflict occurs, give alert.
  conflictOccurred = (schedulerData, action, event, type, slotId, slotName, start, end) => {
    var message = `This is conflicting with a schedule set for ${slotName}.`
    alert(message)
  }
}


export default withDragDropContext(Basic);
