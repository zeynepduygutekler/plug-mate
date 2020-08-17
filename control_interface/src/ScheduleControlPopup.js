import React, { Component } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTrash } from '@fortawesome/free-solid-svg-icons';


class ScheduleControlPopup extends Component {

    componentDidMount() {
        // Automatically select day
        if (this.props.event_rrule.includes("MO,TU,WE,TH,FR,SA,SU")) {
            document.getElementById("ScheduleRepeatEveryDay").checked = true;
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("MO")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatTuesday").checked = true;
            } else {
                // Automatically select Monday
                document.getElementById("ScheduleRepeatMonday").checked = true;
            }
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("TU")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatWednesday").checked = true;
            } else {
                // Automatically select Tuesday
                document.getElementById("ScheduleRepeatTuesday").checked = true;
            }
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("WE")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatThursday").checked = true;
            } else {
                // Automatically select Wednesday
                document.getElementById("ScheduleRepeatWednesday").checked = true;
            }
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("TH")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatFriday").checked = true;
            } else {
                // Automatically select Thursday
                document.getElementById("ScheduleRepeatThursday").checked = true;
            }
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("FR")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatSaturday").checked = true;
            } else {
                // Automatically select Friday
                document.getElementById("ScheduleRepeatFriday").checked = true;
            }
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("SA")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatSunday").checked = true;
            } else {
                // Automatically select Saturday
                document.getElementById("ScheduleRepeatSaturday").checked = true;
            }
        }
        if (this.props.event_rrule.substring(66,this.props.event_rrule.length).includes("SU")) {
            if (this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length) < "08:00:00" && this.props.type !== "new") {
                document.getElementById("ScheduleRepeatMonday").checked = true;
            } else {
                // Automatically select Sunday
                document.getElementById("ScheduleRepeatSunday").checked = true;
            }
        }

        // Automatically select plug load
        if (this.props.device_type.includes("Desktop")) {
            // Automatically select Desktop
            document.getElementById("ScheduleApplyDesktop").checked = true;
        }
        if (this.props.device_type.includes("Monitor")) {
            // Automatically select Monitor
            document.getElementById("ScheduleApplyMonitor").checked = true;
        }
        if (this.props.device_type.includes("Laptop")) {
            // Automatically select Laptop
            document.getElementById("ScheduleApplyLaptop").checked = true;
        }
        if (this.props.device_type.includes("Task Lamp")) {
            // Automatically select Task Lamp
            document.getElementById("ScheduleApplyTaskLamp").checked = true;
        }
        if (this.props.device_type.includes("Fan")) {
            // Automatically select Fan
            document.getElementById("ScheduleApplyFan").checked = true;
        }
    }

    exitPopup = (e) => {
        if (e.target === document.getElementById("schedule_popup_overlay")) {
            this.props.closeButtonClicked();
        }
    }

    render() {
        return (
            <>
                <div id="schedule_popup_overlay" onClick={this.exitPopup}>
                    <div id="schedule_popup">
                        <p id="schedule_device_type"> {this.props.device_type} </p>
                        <button id="schedule_popup_close" onClick={this.props.closeButtonClicked}> &times; </button>
                        <br/>
                        <input id="schedule_name_input" defaultValue={this.props.event_name.substring(0,this.props.event_name.length-22)} type="text" />
                        <div id="schedule_time_input">
                            <FontAwesomeIcon icon={faClock} style={{color:"#4E73DF"}} />
                            <ScheduleControlTimepicker type="Start" time={this.props.event_start.substring(this.props.event_start.length-8, this.props.event_start.length)} />
                            <p style={{display: "inline-block", marginRight:"-5px", marginLeft:"5px"}}> - </p>
                            <ScheduleControlTimepicker type="End" time={this.props.event_end.substring(this.props.event_end.length-8, this.props.event_end.length)} />
                        </div>
                        <div id="schedule_repeat_input">
                            <ScheduleControlRepeat />
                        </div>
                        <div id="schedule_apply_input">
                            <p style={{fontWeight:"bold"}}> Also apply to: </p>
                            <ScheduleControlApply devices={["Desktop", "Monitor", "Laptop", "Fan", "Task Lamp"]} />
                        </div>
                        <br/>
                        <button id="schedule_popup_ok" onClick={this.props.okButtonClicked} className="btn btn-sm"> OK </button>
                        <button id="schedule_popup_delete" onClick={this.props.deleteButtonClicked} className="btn btn-sm"> Delete </button>
                    </div>
                </div>
            </>
        )
    }
}

class ScheduleControlTimepicker extends Component {
    render() {
        var hour = this.props.time.substring(0,2);
        if (Number(hour) >= 12) {
            var am_pm = "PM"
        } else {
            am_pm = "AM"
        }
        if (Number(hour) > 12 && Number(hour) < 22) {
            hour = "0" + (Number(hour)-12).toString();
        } else {
            if (Number(hour) >= 22) {
                hour = (Number(hour)-12).toString();
            } else {
                if (hour === "00") {
                    hour = "12"
                }
            }
        }
        var minute = this.props.time.substring(3,5);



        return (
            <div id={this.props.type + "Time"}>
                <select id={this.props.type + "Hour"} defaultValue={hour}>
                    <option value="01"> 1 </option>
                    <option value="02"> 2 </option>
                    <option value="03"> 3 </option>
                    <option value="04"> 4 </option>
                    <option value="05"> 5 </option>
                    <option value="06"> 6 </option>
                    <option value="07"> 7 </option>
                    <option value="08"> 8 </option>
                    <option value="09"> 9 </option>
                    <option value="10"> 10 </option>
                    <option value="11"> 11 </option>
                    <option value="12"> 12 </option>
                </select>
                <span style={{marginLeft:"-10px", marginRight:"1px"}}> : </span>
                <select id={this.props.type + "Minute"} defaultValue={minute}>
                    <option value="00"> 00 </option>
                    <option value="15"> 15 </option>
                    <option value="30"> 30 </option>
                    <option value="45"> 45 </option>
                </select>
                <select id={this.props.type + "AMPM"} defaultValue={am_pm}>
                    <option value="AM"> AM </option>
                    <option value="PM"> PM </option>
                </select>
            </div>
        )
    }
}

class ScheduleControlRepeat extends Component {
    render() {
        return (
            <>
                <p style={{fontWeight:"bold"}}> Repeat: </p>
                <input
                    type="checkbox"
                    id="ScheduleRepeatEveryDay"
                    value="Every Day"
                    onClick={function(e) {
                        if (e.target.checked) {
                            document.getElementById("ScheduleRepeatMonday").checked = true;
                            document.getElementById("ScheduleRepeatTuesday").checked = true;
                            document.getElementById("ScheduleRepeatWednesday").checked = true;
                            document.getElementById("ScheduleRepeatThursday").checked = true;
                            document.getElementById("ScheduleRepeatFriday").checked = true;
                            document.getElementById("ScheduleRepeatSaturday").checked = true;
                            document.getElementById("ScheduleRepeatSunday").checked = true;
                        } else {
                            document.getElementById("ScheduleRepeatMonday").checked = false;
                            document.getElementById("ScheduleRepeatTuesday").checked = false;
                            document.getElementById("ScheduleRepeatWednesday").checked = false;
                            document.getElementById("ScheduleRepeatThursday").checked = false;
                            document.getElementById("ScheduleRepeatFriday").checked = false;
                            document.getElementById("ScheduleRepeatSaturday").checked = false;
                            document.getElementById("ScheduleRepeatSunday").checked = false;
                        }
                    }}
                />
                <label htmlFor="ScheduleRepeatEveryDay" style={{marginLeft: "2px"}}> Every Day </label>
                <br />
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Monday"
                        id="ScheduleRepeatMonday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatTuesday").checked && document.getElementById("ScheduleRepeatWednesday").checked &&
                                    document.getElementById("ScheduleRepeatThursday").checked && document.getElementById("ScheduleRepeatFriday").checked &&
                                    document.getElementById("ScheduleRepeatSaturday").checked && document.getElementById("ScheduleRepeatSunday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Monday </label>
                </div>
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Tuesday"
                        id="ScheduleRepeatTuesday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatMonday").checked && document.getElementById("ScheduleRepeatWednesday").checked &&
                                    document.getElementById("ScheduleRepeatThursday").checked && document.getElementById("ScheduleRepeatFriday").checked &&
                                    document.getElementById("ScheduleRepeatSaturday").checked && document.getElementById("ScheduleRepeatSunday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Tuesday </label>
                </div>
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Wednesday"
                        id="ScheduleRepeatWednesday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatMonday").checked && document.getElementById("ScheduleRepeatTuesday").checked &&
                                    document.getElementById("ScheduleRepeatThursday").checked && document.getElementById("ScheduleRepeatFriday").checked &&
                                    document.getElementById("ScheduleRepeatSaturday").checked && document.getElementById("ScheduleRepeatSunday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Wednesday </label>
                </div>
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Thursday"
                        id="ScheduleRepeatThursday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatMonday").checked && document.getElementById("ScheduleRepeatTuesday").checked &&
                                    document.getElementById("ScheduleRepeatWednesday").checked && document.getElementById("ScheduleRepeatFriday").checked &&
                                    document.getElementById("ScheduleRepeatSaturday").checked && document.getElementById("ScheduleRepeatSunday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Thursday </label>
                </div>
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Friday"
                        id="ScheduleRepeatFriday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatMonday").checked && document.getElementById("ScheduleRepeatTuesday").checked &&
                                    document.getElementById("ScheduleRepeatWednesday").checked && document.getElementById("ScheduleRepeatThursday").checked &&
                                    document.getElementById("ScheduleRepeatSaturday").checked && document.getElementById("ScheduleRepeatSunday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Friday </label>
                </div>
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Saturday"
                        id="ScheduleRepeatSaturday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatMonday").checked && document.getElementById("ScheduleRepeatTuesday").checked &&
                                    document.getElementById("ScheduleRepeatWednesday").checked && document.getElementById("ScheduleRepeatThursday").checked &&
                                    document.getElementById("ScheduleRepeatFriday").checked && document.getElementById("ScheduleRepeatSunday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Saturday </label>
                </div>
                <div style={{display:"inline-block", width:"130px"}}>
                    <input
                        type="checkbox"
                        name="ScheduleRepeatOption"
                        value="Sunday"
                        id="ScheduleRepeatSunday"
                        onClick={function(e) {
                            if (!e.target.checked) {
                                document.getElementById("ScheduleRepeatEveryDay").checked = false;
                            } else {
                                if (document.getElementById("ScheduleRepeatMonday").checked && document.getElementById("ScheduleRepeatTuesday").checked &&
                                    document.getElementById("ScheduleRepeatWednesday").checked && document.getElementById("ScheduleRepeatThursday").checked &&
                                    document.getElementById("ScheduleRepeatFriday").checked && document.getElementById("ScheduleRepeatSaturday").checked) {
                                        document.getElementById("ScheduleRepeatEveryDay").checked = true;
                                    }
                            }
                        }}
                    />
                    <label style={{marginLeft: "2px"}}> Sunday </label>
                </div>
            </>
        )
    }
}

class ScheduleControlApply extends Component {
    render() {
        const devices = this.props.devices.map(device =>
            <ScheduleControlApplyItem device_type={device} />
        )
        return(
            <>
                {devices}
            </>
        )
    }
}

class ScheduleControlApplyItem extends Component {
    render() {
        return (
            <div style={{display:"inline-block", width:"130px"}}>
                <input
                    type="checkbox"
                    name="ScheduleApplyOption"
                    id={"ScheduleApply" + this.props.device_type.replace(/\s/g,'')}
                />
                <label style={{marginLeft: "2px"}}> {this.props.device_type} </label>
            </div>
        )
    }
}
export default ScheduleControlPopup;