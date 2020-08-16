import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Scheduler, { SchedulerData, ViewTypes } from 'react-big-scheduler';
import 'react-big-scheduler/lib/css/style.css';
import withDragDropContext from './withDnDContext';
import OnlyAlert from './OnlyAlert';
import ConflictAlert from './ConflictAlert';
import ScheduleControlPopup from './ScheduleControlPopup';
import './index.css';

function from24to12(hour) {
    var new_hour = Number(hour.substring(0,2));
    var am_or_pm = new_hour >= 12 ? "PM" : "AM";
    new_hour = (new_hour % 12) || 12;
    var finalTime = new_hour + ":" + hour.substring(3,5) + " " + am_or_pm;

    if (finalTime.length !== 8) {
        finalTime = "0" + finalTime
    }
    return (finalTime);
}

function from12to24(hour) {
    var new_hour = Number(hour.substring(0,2))
    if (hour.substring(6,8) === "PM" && new_hour !== 12) {
        new_hour = new_hour + 12;
    }
    if (hour.substring(6,8) === "AM" && new_hour === 12) {
        new_hour = "00"
    }
    var finalTime = new_hour + ":" + hour.substring(3,5) + ":00"
    if (finalTime.length !== 8) {
        finalTime = "0" + finalTime
    }
    return(finalTime)
}

function formatForDatabaseAdd(book, current_user_id) {
    var event_rrule = ""
    if (book.rrule.substring(60,book.rrule.length).includes("MO")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeMon, "
        } else {
            event_rrule = event_rrule + "Monday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeTue, "
        } else {
            event_rrule = event_rrule + "Tuesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("WE")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeWed, "
        } else {
            event_rrule = event_rrule + "Wednesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TH")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeThu, "
        } else {
            event_rrule = event_rrule + "Thursday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("FR")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeFri, "
        } else {
            event_rrule = event_rrule + "Friday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SA")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeSat, "
        } else {
            event_rrule = event_rrule + "Saturday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeSun, "
        } else {
            event_rrule = event_rrule + "Sunday, "
        }
    }


    const devices = ["Desktop", "Laptop", "Monitor", "Task Lamp", "Fan"]

    return({
        user_id: Number(current_user_id),
        event_id: book.id,
        event_start: book.start.substring(book.start.length-8, book.start.length),
        event_end: book.end.substring(book.end.length-8, book.end.length),
        event_name: book.title.substring(0, book.title.length-22),
        event_rrule: event_rrule.substring(0,event_rrule.length-2),
        device_type_id: book.resourceId,
        device_type: devices[book.resourceId - 1]
    })
}

function formatForDatabaseUpdate(book, current_user_id) {
    var event_rrule = ""
    if (book.rrule.substring(60,book.rrule.length).includes("MO")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeMon, "
        } else {
            event_rrule = event_rrule + "Monday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeTue, "
        } else {
            event_rrule = event_rrule + "Tuesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("WE")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeWed, "
        } else {
            event_rrule = event_rrule + "Wednesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TH")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeThu, "
        } else {
            event_rrule = event_rrule + "Thursday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("FR")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeFri, "
        } else {
            event_rrule = event_rrule + "Friday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SA")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeSat, "
        } else {
            event_rrule = event_rrule + "Saturday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "BeforeSun, "
        } else {
            event_rrule = event_rrule + "Sunday, "
        }
    }

    const devices = ["Desktop", "Laptop", "Monitor", "Task Lamp", "Fan"]

    if (typeof book.id === "string") {
        var n = book.id.indexOf("-")
        var event_id = Number(book.id.substring(0,n))
    } else {
        event_id = book.id
    }
    return({
        user_id: Number(current_user_id),
        event_id: event_id,
        event_start: book.start.substring(book.start.length-8, book.start.length),
        event_end: book.end.substring(book.end.length-8, book.end.length),
        event_name: book.title.substring(0, book.title.length-22),
        event_rrule: event_rrule.substring(0,event_rrule.length-2),
        device_type_id: book.resourceId,
        device_type: devices[book.resourceId - 1],
        id: book.database_id
    })
}

function processHourInput(type) {
    var hour = document.getElementById(type + "Hour").value;
    if (document.getElementById(type + "AMPM").value === "PM") {
        if (document.getElementById(type + "Hour").value !== "12") {
            hour = (Number(document.getElementById(type + "Hour").value) + 12).toString();
        }
    } else {
        if (document.getElementById(type + "Hour").value === "12") {
            hour = "00";
        }
    }
    return(hour)
}

function getDates() {
    var today = new Date();
    var mondayDate = new Date();
    var tuesdayDate = new Date();
    var wednesdayDate = new Date();
    var thursdayDate = new Date();
    var fridayDate = new Date();
    var saturdayDate = new Date();
    var sundayDate = new Date();

    if (today.getDay() === 0) {
        // Today is Sunday
        mondayDate.setDate(today.getDate() - 6);
        tuesdayDate.setDate(today.getDate() - 5);
        wednesdayDate.setDate(today.getDate() - 4);
        thursdayDate.setDate(today.getDate() - 3);
        fridayDate.setDate(today.getDate() - 2);
        saturdayDate.setDate(today.getDate() - 1);
        sundayDate.setDate(today.getDate());
    } else {
        mondayDate.setDate(today.getDate() + (1 - today.getDay()));
        tuesdayDate.setDate(today.getDate() + (2 - today.getDay()));
        wednesdayDate.setDate(today.getDate() + (3 - today.getDay()));
        thursdayDate.setDate(today.getDate() + (4 - today.getDay()));
        fridayDate.setDate(today.getDate() + (5 - today.getDay()));
        saturdayDate.setDate(today.getDate() + (6 - today.getDay()));
        sundayDate.setDate(today.getDate() + (7 - today.getDay()));
    }

    mondayDate = mondayDate.getFullYear() + "-" + ((mondayDate.getMonth() + 1).toString().length === 1 ? "0" + (mondayDate.getMonth() + 1).toString() : (mondayDate.getMonth() + 1)) + "-" + (mondayDate.getDate().toString().length === 1 ? "0" + mondayDate.getDate().toString() : mondayDate.getDate())
    tuesdayDate = tuesdayDate.getFullYear() + "-" + ((tuesdayDate.getMonth() + 1).toString().length === 1 ? "0" + (tuesdayDate.getMonth() + 1).toString() : (tuesdayDate.getMonth() + 1)) + "-" + (tuesdayDate.getDate().toString().length === 1 ? "0" + tuesdayDate.getDate().toString() : tuesdayDate.getDate())
    wednesdayDate = wednesdayDate.getFullYear() + "-" + ((wednesdayDate.getMonth() + 1).toString().length === 1 ? "0" + (wednesdayDate.getMonth() + 1).toString() : (wednesdayDate.getMonth() + 1)) + "-" + (wednesdayDate.getDate().toString().length === 1 ? "0" + wednesdayDate.getDate().toString() : wednesdayDate.getDate())
    thursdayDate = thursdayDate.getFullYear() + "-" + ((thursdayDate.getMonth() + 1).toString().length === 1 ? "0" + (thursdayDate.getMonth() + 1).toString() : (thursdayDate.getMonth() + 1))  + "-" + (thursdayDate.getDate().toString().length === 1 ? "0" + thursdayDate.getDate().toString() : thursdayDate.getDate())
    fridayDate = fridayDate.getFullYear() + "-" + ((fridayDate.getMonth() + 1).toString().length === 1 ? "0" + (fridayDate.getMonth() + 1).toString() : (fridayDate.getMonth() + 1)) + "-" + (fridayDate.getDate().toString().length === 1 ? "0" + fridayDate.getDate().toString() : fridayDate.getDate())
    saturdayDate = saturdayDate.getFullYear() + "-" + ((saturdayDate.getMonth() + 1).toString().length === 1 ? "0" + (saturdayDate.getMonth() + 1).toString() : (saturdayDate.getMonth() + 1)) + "-" + (saturdayDate.getDate().toString().length === 1 ? "0" + saturdayDate.getDate().toString() : saturdayDate.getDate())
    sundayDate = sundayDate.getFullYear() + "-" + ((sundayDate.getMonth() + 1).toString().length === 1 ? "0" + (sundayDate.getMonth() + 1).toString() : (sundayDate.getMonth() + 1)) + "-" + (sundayDate.getDate().toString().length === 1 ? "0" + sundayDate.getDate().toString() : sundayDate.getDate())

    return([mondayDate, tuesdayDate, wednesdayDate, thursdayDate, fridayDate, saturdayDate, sundayDate])
}

class Calendar extends Component {
    constructor(props) {
        super(props);
        let schedulerData = new SchedulerData(
            this.props.date,
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
        schedulerData.setResources([{id:1, name:"Desktop"}, {id:5, name:"Fan"}, {id:2, name:"Laptop"}, {id:3, name:"Monitor"}, {id:4, name:"Task Lamp"}]);
        schedulerData.setEvents(this.props.events);
        this.state = {
            viewModel: schedulerData,
            achievements_books: [],
            weekly_achievements_books: [],
            points_wallet_books: [],
            key: 1
        };
        window.calendar = this;
    }

    render() {
        const { viewModel } = this.state;
        return (
            <div>
                <div>
                    <Scheduler
                        key={this.state.key}
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

    componentDidMount() {
        this.refetchBonusAchievementsData();
        this.refetchWeeklyAchievementsData();
        this.refetchPointsWalletData();
    }

    refetchBonusAchievementsData = () => {
        fetch('https://plugmate.herokuapp.com/control_interface/api/achievements_bonus/')
        .then(response => response.json())
        .then(data => {
            this.setState({achievements_books: data})
        })

        setTimeout(this.refetchBonusAchievementsData, 10000)
    }

    refetchWeeklyAchievementsData = () => {
        fetch('https://plugmate.herokuapp.com/control_interface/api/achievements_weekly/')
        .then(response => response.json())
        .then(data => {
            this.setState({weekly_achievements_books: data})
        })

        setTimeout(this.refetchWeeklyAchievementsData, 10000)
    }

    refetchPointsWalletData = () => {
        fetch('https://plugmate.herokuapp.com/control_interface/api/points_wallet/')
        .then(response => response.json())
        .then(data => {
            this.setState({points_wallet_books: data})
        })

        setTimeout(this.refetchPointsWalletData, 10000)
    }

    updateAchievementsBooks = (newBook) => {
        fetch('https://plugmate.herokuapp.com/control_interface/api/achievements_bonus/' + newBook.id.toString() + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        }).then(response => response.json())
        .then(newBook => {
            const newBooks = this.state.achievements_books.map(book => {
                if (book.id === newBook.id) {
                    return Object.assign({}, newBook);
                } else {
                    return book;
                }
            });
            this.setState({achievements_books: newBooks})
        })
    }

    updateWeeklyAchievementsBooks = (newBook) => {
        fetch('https://plugmate.herokuapp.com/control_interface/api/achievements_weekly/' + newBook.id.toString() + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        }).then(response => response.json())
        .then(newBook => {
            const newBooks = this.state.weekly_achievements_books.map(book => {
                if (book.id === newBook.id) {
                    return Object.assign({}, newBook);
                } else {
                    return book;
                }
            });
            this.setState({weekly_achievements_books: newBooks})
        })
    }

    updatePointsWalletBooks = (newBook) => {
        fetch('https://plugmate.herokuapp.com/control_interface/api/points_wallet/' + newBook.id.toString() + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        }).then(response => response.json())
        .then(newBook => {
            const newBooks = this.state.points_wallet_books.map(book => {
                if (book.id === newBook.id) {
                    return Object.assign({}, newBook);
                } else {
                    return book;
                }
            });
            this.setState({points_wallet_books: newBooks})
        })
    }

    handleAchievementsUpdate = (book) => {
        book.id = this.props.current_user_id;
        this.updateAchievementsBooks(book);
    }

    handleWeeklyAchievementsUpdate = (book) => {
        book.id = this.props.current_user_id;
        this.updateWeeklyAchievementsBooks(book);
    }

    handlePointsWalletUpdate = (book) => {
        book.id = this.props.user_id;
        this.updatePointsWalletBooks(book);
    }

    handleAchievementsFormSubmit = () => {
        this.handleAchievementsUpdate(this.state.achievements_books[0])
    }

    handleWeeklyAchievementsFormSubmit = () => {
        this.handleWeeklyAchievementsUpdate(this.state.weekly_achievements_books[0])
    }

    handlePointsWalletFormSubmit = () => {
        this.handlePointsWalletUpdate(this.state.points_wallet_books[0])
    }

    isNonWorkingTime = (schedulerData, time) => {
        return true;
    }

    getScrollSpecialMoment = (schedulerData, startMoment, endMoment) => {
        var time = this.props.date + " 07:00:00";
        return moment(time);
    }

    eventClicked = (schedulerData, event) => {
        var slotName = schedulerData.getSlotById(event.resourceId).name;

        function closeButtonClicked() {
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }

        function deleteButtonClicked() {
            // Update database (Delete)
            window.calendar.props.onDeleteClick(event.database_id)
            window.calendar.props.refetchData();

            // Update calendar
            schedulerData.removeEvent(event);
            window.calendar.setState({
                viewModel: schedulerData
            });
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }

        function okButtonClicked() {
            var check_start_time = "2020-01-01 " + from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
            var check_end_time = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)
            if (check_end_time === "00:00:00") {
                check_end_time = "2020-01-02 " + check_end_time
            } else {
                check_end_time = "2020-01-01 " + check_end_time
            }
            if (check_start_time >= check_end_time) {
                ReactDOM.render(
                    <OnlyAlert
                        message="Check your timings! Start time should be before end time."
                        onOK={function() {
                            ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                        }}
                    />, document.getElementById("confirm-alert")
                )
            } else {
                // Checking conflicts
                var hasConflict = false;
                var conflictedEvents = [];
                var plugload_option = document.querySelectorAll('input[name="ScheduleApplyOption"]:checked');
                var repeat_option = document.querySelectorAll('input[name="ScheduleRepeatOption"]:checked');
                var new_days_to_loop_over = [];
                for (var repeat_day of repeat_option) {
                    if (repeat_day === document.getElementById("ScheduleRepeatMonday")) {
                        new_days_to_loop_over.push(getDates()[0])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatTuesday")) {
                        new_days_to_loop_over.push(getDates()[1])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatWednesday")) {
                        new_days_to_loop_over.push(getDates()[2])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatThursday")) {
                        new_days_to_loop_over.push(getDates()[3])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatFriday")) {
                        new_days_to_loop_over.push(getDates()[4])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSaturday")) {
                        new_days_to_loop_over.push(getDates()[5])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSunday")) {
                        new_days_to_loop_over.push(getDates()[6])
                    }
                }

                var new_start = from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
                var new_end = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)

                var new_start_for_this = "";
                var new_end_for_this = "";
                var existing_start_for_this = "";
                var existing_end_for_this = "";
                for (var new_day of new_days_to_loop_over) {
                    new_start_for_this = new_day + " " + new_start;
                    new_end_for_this = new_day + " " + new_end;
                    for (var plugload of plugload_option) {
                        schedulerData.events.forEach(function(e) {
                            var current_resource_id = 0
                            if (plugload === document.getElementById("ScheduleApplyDesktop")) {
                                current_resource_id = 1
                            }
                            if (plugload === document.getElementById("ScheduleApplyLaptop")) {
                                current_resource_id = 2
                            }
                            if (plugload === document.getElementById("ScheduleApplyMonitor")) {
                                current_resource_id = 3
                            }
                            if (plugload === document.getElementById("ScheduleApplyTaskLamp")) {
                                current_resource_id = 4
                            }
                            if (plugload === document.getElementById("ScheduleApplyFan")) {
                                current_resource_id = 5
                            }
                            if (e.resourceId === current_resource_id) {
                                var existing_days_to_loop_over = [];
                                if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                    existing_days_to_loop_over.push(getDates()[0])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                    existing_days_to_loop_over.push(getDates()[1])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                    existing_days_to_loop_over.push(getDates()[2])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                    existing_days_to_loop_over.push(getDates()[3])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                    existing_days_to_loop_over.push(getDates()[4])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                    existing_days_to_loop_over.push(getDates()[5])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                    existing_days_to_loop_over.push(getDates()[6])
                                }

                                for (var existing_day of existing_days_to_loop_over) {
                                    existing_start_for_this = existing_day + e.start.substring(10,19);
                                    existing_end_for_this = existing_day + e.end.substring(10,19);
                                    if (((new_start_for_this >= existing_start_for_this &&
                                          new_start_for_this < existing_end_for_this) || (
                                          new_end_for_this > existing_start_for_this &&
                                          new_end_for_this <= existing_end_for_this) || (
                                          existing_start_for_this >= new_start_for_this &&
                                          existing_start_for_this < new_end_for_this) || (
                                          existing_end_for_this > new_start_for_this &&
                                          existing_end_for_this <= new_end_for_this)) && (
                                          e.id !== event.id)) {
                                            hasConflict = true;
                                            if (!conflictedEvents.includes(e)) {
                                                conflictedEvents.push(e)
                                            }
                                          }
                                }
                            }
                        })
                    }
                }

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = "";
                        if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                            day = day + "Monday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                            day = day + "Tuesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                            day = day + "Wednesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                            day = day + "Thursday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                            day = day + "Friday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                            day = day + "Saturday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                            day = day + "Sunday, "
                        }
                        var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
                        message += `<new>- ${events.title} for ${current_plugload_conflicted} on ${day.substring(0,day.length-2)}`
                    }
                    ReactDOM.render(
                        <ConflictAlert
                            message={message}
                            onOK={function() {
                                ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                            }}
                        />, document.getElementById("confirm-alert")
                    )
                } else {
                    // Rename
                    event.title = document.getElementById("schedule_name_input").value + " (" +
                                  document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " +
                                  document.getElementById("StartAMPM").value + " - " + document.getElementById("EndHour").value + ":" +
                                  document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value + ")";

                    // Update start
                    schedulerData.updateEventStart(event, window.calendar.props.date + " " + processHourInput("Start") + ":" + document.getElementById("StartMinute").value + ":00");

                    // Update end
                    schedulerData.updateEventEnd(event, window.calendar.props.date + " " + processHourInput("End") + ":" + document.getElementById("EndMinute").value + ":00")

                    // Update repeat
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.mondayDate.substring(0,4) +
                                      window.calendar.props.mondayDate.substring(5,7) +
                                      window.calendar.props.mondayDate.substring(8,10) + "T000000Z;UNTIL=" +
                                      window.calendar.props.sundayDate.substring(0,4) +
                                      window.calendar.props.sundayDate.substring(5,7) +
                                      window.calendar.props.sundayDate.substring(8,10) + "T235900Z;BYDAY="
                    if (document.getElementById("ScheduleRepeatEveryDay").checked) {
                        // Repeat Every Day
                        event.rrule = event_rrule + "MO,TU,WE,TH,FR,SA,SU";
                    } else {
                        if (document.getElementById("ScheduleRepeatMonday").checked) {
                            event_rrule = event_rrule + "MO,"
                        }
                        if (document.getElementById("ScheduleRepeatTuesday").checked) {
                            event_rrule = event_rrule + "TU,"
                        }
                        if (document.getElementById("ScheduleRepeatWednesday").checked) {
                            event_rrule = event_rrule + "WE,"
                        }
                        if (document.getElementById("ScheduleRepeatThursday").checked) {
                            event_rrule = event_rrule + "TH,"
                        }
                        if (document.getElementById("ScheduleRepeatFriday").checked) {
                            event_rrule = event_rrule + "FR,"
                        }
                        if (document.getElementById("ScheduleRepeatSaturday").checked) {
                            event_rrule = event_rrule + "SA,"
                        }
                        if (document.getElementById("ScheduleRepeatSunday").checked) {
                            event_rrule = event_rrule + "SU,"
                        }
                        event.rrule = event_rrule.substring(0,event_rrule.length-1)
                    }

                    // Apply to other devices
                    document.getElementById("ScheduleApply" + slotName.replace(/\s/g, '')).checked = false;
                    var newFreshId = 0;
                    schedulerData.events.forEach(item => {
                        if (item.database_id >= newFreshId || item.id >= newFreshId) {
                            newFreshId = item.database_id;
                        }
                    })
                    if (document.getElementById("ScheduleApplyDesktop").checked) {
                        newFreshId = newFreshId + 1;
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 1,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyMonitor").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 3,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyLaptop").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 2,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyTaskLamp").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 4,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyFan").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 5,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();


                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));


                    // Update weekly achievement
                    if (window.calendar.state.weekly_achievements_books[0].schedule_based === 0) {
                        window.calendar.setState({
                            weekly_achievements_books: [
                                {
                                    ...window.calendar.state.weekly_achievements_books[0],
                                    schedule_based: 20
                                }
                            ]
                        }, function() {window.calendar.handleWeeklyAchievementsFormSubmit()})
                        // If first time clicking, update achievement
                        if (window.calendar.state.achievements_books[0].first_schedule === 0) {
                            window.calendar.setState({
                                achievements_books: [
                                    {
                                        ...window.calendar.state.achievements_books[0],
                                        first_schedule: 70
                                    }
                                ]
                            }, function() {window.calendar.handleAchievementsFormSubmit()})
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 90
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                            window.presencecontrol.setState({key: window.presencecontrol.state.key + 1})
                        } else {
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 20
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                        }

                    }
                    console.log(event);
                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 1000)
                }
            }
        }

         ReactDOM.render(
            <ScheduleControlPopup
                device_type={"Edit Schedule: " + slotName}
                event_rrule={event.rrule}
                event_start={event.start}
                event_end={event.end}
                event_name={event.title}
                okButtonClicked={okButtonClicked}
                closeButtonClicked={closeButtonClicked}
                deleteButtonClicked={deleteButtonClicked}
            />, document.getElementById("popup-container-schedule")
        )
    }

    newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
        let newFreshId = 0;
        schedulerData.events.forEach(item => {
            if (item.database_id >= newFreshId || item.id >= newFreshId) newFreshId = item.database_id + 1;
        });

        let newEvent = {
            id: newFreshId,
            title: "(no name) (" + moment(start).format("hh:mm A") + " - " + moment(end).format("hh:mm A") + ")",
            start: start,
            end: end,
            resourceId: slotId,
            bgColor: "#06D6A0",
            showPopover: false,
            rrule: "FREQ=WEEKLY;DTSTART=" + this.props.mondayDate.substring(0,4) + this.props.mondayDate.substring(5,7) + this.props.mondayDate.substring(8,10) + "T000000Z;UNTIL=" + this.props.sundayDate.substring(0,4) + this.props.sundayDate.substring(5,7) + this.props.sundayDate.substring(8,10) + "T235900Z;BYDAY=" + this.props.day.substring(0,2).toUpperCase()
        }

        schedulerData.addEvent(newEvent);
        this.setState({
            viewModel: schedulerData
        })

        function closeButtonClicked() {
            // Update database (Add)
            window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id))
            window.calendar.props.refetchData();

            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }
        function deleteButtonClicked() {
            schedulerData.removeEvent(newEvent);
            window.calendar.setState({
                viewModel: schedulerData
            })
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }

        function okButtonClicked() {
            var check_start_time = "2020-01-01 " + from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
            var check_end_time = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)
            if (check_end_time === "00:00:00") {
                check_end_time = "2020-01-02 " + check_end_time
            } else {
                check_end_time = "2020-01-01 " + check_end_time
            }
            if (check_start_time >= check_end_time) {
                ReactDOM.render(
                    <OnlyAlert
                        message="Check your timings! Start time should be before end time."
                        onOK={function() {
                            ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                        }}
                    />, document.getElementById("confirm-alert")
                )
            } else {
                // Checking conflicts
                var hasConflict = false;
                var conflictedEvents = [];
                var plugload_option = document.querySelectorAll('input[name="ScheduleApplyOption"]:checked');
                var repeat_option = document.querySelectorAll('input[name="ScheduleRepeatOption"]:checked');
                var new_days_to_loop_over = [];
                for (var repeat_day of repeat_option) {
                    if (repeat_day === document.getElementById("ScheduleRepeatMonday")) {
                        new_days_to_loop_over.push(getDates()[0])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatTuesday")) {
                        new_days_to_loop_over.push(getDates()[1])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatWednesday")) {
                        new_days_to_loop_over.push(getDates()[2])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatThursday")) {
                        new_days_to_loop_over.push(getDates()[3])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatFriday")) {
                        new_days_to_loop_over.push(getDates()[4])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSaturday")) {
                        new_days_to_loop_over.push(getDates()[5])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSunday")) {
                        new_days_to_loop_over.push(getDates()[6])
                    }
                }

                var new_start = from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
                var new_end = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)

                var new_start_for_this = "";
                var new_end_for_this = "";
                var existing_start_for_this = "";
                var existing_end_for_this = "";
                for (var new_day of new_days_to_loop_over) {
                    new_start_for_this = new_day + " " + new_start;
                    new_end_for_this = new_day + " " + new_end;
                    for (var plugload of plugload_option) {
                        schedulerData.events.forEach(function(e) {
                            var current_resource_id = 0
                            if (plugload === document.getElementById("ScheduleApplyDesktop")) {
                                current_resource_id = 1
                            }
                            if (plugload === document.getElementById("ScheduleApplyLaptop")) {
                                current_resource_id = 2
                            }
                            if (plugload === document.getElementById("ScheduleApplyMonitor")) {
                                current_resource_id = 3
                            }
                            if (plugload === document.getElementById("ScheduleApplyTaskLamp")) {
                                current_resource_id = 4
                            }
                            if (plugload === document.getElementById("ScheduleApplyFan")) {
                                current_resource_id = 5
                            }
                            if (e.resourceId === current_resource_id) {
                                var existing_days_to_loop_over = [];
                                if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                    existing_days_to_loop_over.push(getDates()[0])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                    existing_days_to_loop_over.push(getDates()[1])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                    existing_days_to_loop_over.push(getDates()[2])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                    existing_days_to_loop_over.push(getDates()[3])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                    existing_days_to_loop_over.push(getDates()[4])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                    existing_days_to_loop_over.push(getDates()[5])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                    existing_days_to_loop_over.push(getDates()[6])
                                }

                                for (var existing_day of existing_days_to_loop_over) {
                                    existing_start_for_this = existing_day + e.start.substring(10,19);
                                    existing_end_for_this = existing_day + e.end.substring(10,19);
                                    if (((new_start_for_this >= existing_start_for_this &&
                                          new_start_for_this < existing_end_for_this) || (
                                          new_end_for_this > existing_start_for_this &&
                                          new_end_for_this <= existing_end_for_this) || (
                                          existing_start_for_this >= new_start_for_this &&
                                          existing_start_for_this < new_end_for_this) || (
                                          existing_end_for_this > new_start_for_this &&
                                          existing_end_for_this <= new_end_for_this)) && (
                                          e.id !== newEvent.id)) {
                                            hasConflict = true;
                                            if (!conflictedEvents.includes(e)) {
                                                conflictedEvents.push(e)
                                            }
                                          }
                                }
                            }
                        })
                    }
                }

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                            day = day + "Monday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                            day = day + "Tuesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                            day = day + "Wednesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                            day = day + "Thursday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                            day = day + "Friday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                            day = day + "Saturday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                            day = day + "Sunday, "
                        }
                        var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
                        message += `<new>- ${events.title} for ${current_plugload_conflicted} on ${day.substring(0,day.length-2)}`
                    }
                    ReactDOM.render(
                        <ConflictAlert
                            message={message}
                            onOK={function() {
                                ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                            }}
                        />, document.getElementById("confirm-alert")
                    )
                } else {
                    // Rename
                    newEvent.title = document.getElementById("schedule_name_input").value + " (" +
                                     document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " +
                                     document.getElementById("StartAMPM").value + " - " + document.getElementById("EndHour").value + ":" +
                                     document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value + ")";

                    // Update start
                    schedulerData.updateEventStart(newEvent, window.calendar.props.date + " " + processHourInput("Start") + ":" + document.getElementById("StartMinute").value + ":00");

                    // Update end
                    schedulerData.updateEventEnd(newEvent, window.calendar.props.date + " " + processHourInput("End") + ":" + document.getElementById("EndMinute").value + ":00")

                    // Update repeat
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.mondayDate.substring(0,4) +
                                      window.calendar.props.mondayDate.substring(5,7) +
                                      window.calendar.props.mondayDate.substring(8,10) + "T000000Z;UNTIL=" +
                                      window.calendar.props.sundayDate.substring(0,4) +
                                      window.calendar.props.sundayDate.substring(5,7) +
                                      window.calendar.props.sundayDate.substring(8,10) + "T235900Z;BYDAY="
                    if (document.getElementById("ScheduleRepeatEveryDay").checked) {
                        // Repeat Every Day
                        newEvent.rrule = event_rrule + "MO,TU,WE,TH,FR,SA,SU";
                    } else {
                        if (document.getElementById("ScheduleRepeatMonday").checked) {
                            event_rrule = event_rrule + "MO,"
                        }
                        if (document.getElementById("ScheduleRepeatTuesday").checked) {
                            event_rrule = event_rrule + "TU,"
                        }
                        if (document.getElementById("ScheduleRepeatWednesday").checked) {
                            event_rrule = event_rrule + "WE,"
                        }
                        if (document.getElementById("ScheduleRepeatThursday").checked) {
                            event_rrule = event_rrule + "TH,"
                        }
                        if (document.getElementById("ScheduleRepeatFriday").checked) {
                            event_rrule = event_rrule + "FR,"
                        }
                        if (document.getElementById("ScheduleRepeatSaturday").checked) {
                            event_rrule = event_rrule + "SA,"
                        }
                        if (document.getElementById("ScheduleRepeatSunday").checked) {
                            event_rrule = event_rrule + "SU,"
                        }
                        newEvent.rrule = event_rrule.substring(0,event_rrule.length-1)
                    }

                    // Apply to other devices
                    document.getElementById("ScheduleApply" + slotName.replace(/\s/g, '')).checked = false;

                    if (document.getElementById("ScheduleApplyDesktop").checked) {
                        newFreshId = newFreshId + 1;
                        let anotherNewEvent = {
                            id: newFreshId,
                            title: newEvent.title,
                            start: newEvent.start,
                            end: newEvent.end,
                            resourceId: 1,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: newEvent.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(anotherNewEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(anotherNewEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyMonitor").checked) {
                        newFreshId = newFreshId + 1;
                        let anotherNewEvent = {
                            id: newFreshId,
                            title: newEvent.title,
                            start: newEvent.start,
                            end: newEvent.end,
                            resourceId: 3,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: newEvent.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(anotherNewEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(anotherNewEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyLaptop").checked) {
                        newFreshId = newFreshId + 1
                        let anotherNewEvent = {
                            id: newFreshId,
                            title: newEvent.title,
                            start: newEvent.start,
                            end: newEvent.end,
                            resourceId: 2,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: newEvent.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(anotherNewEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(anotherNewEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyTaskLamp").checked) {
                        newFreshId = newFreshId + 1
                        let anotherNewEvent = {
                            id: newFreshId,
                            title: newEvent.title,
                            start: newEvent.start,
                            end: newEvent.end,
                            resourceId: 4,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: newEvent.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(anotherNewEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(anotherNewEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyFan").checked) {
                        newFreshId = newFreshId + 1
                        let anotherNewEvent = {
                            id: newFreshId,
                            title: newEvent.title,
                            start: newEvent.start,
                            end: newEvent.end,
                            resourceId: 5,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: newEvent.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(anotherNewEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(anotherNewEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    // Update database (Add)
                    window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Update weekly achievement
                    if (window.calendar.state.weekly_achievements_books[0].schedule_based === 0) {
                        window.calendar.setState({
                            weekly_achievements_books: [
                                {
                                    ...window.calendar.state.weekly_achievements_books[0],
                                    schedule_based: 20
                                }
                            ]
                        }, function() {window.calendar.handleWeeklyAchievementsFormSubmit()})

                        // If first time clicking, update achievement
                        if (window.calendar.state.achievements_books[0].first_schedule === 0) {
                            window.calendar.setState({
                                achievements_books: [
                                    {
                                        ...window.calendar.state.achievements_books[0],
                                        first_schedule: 70
                                    }
                                ]
                            }, function() {window.calendar.handleAchievementsFormSubmit()})
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 90
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                            window.presencecontrol.setState({key: window.presencecontrol.state.key + 1})
                        } else {
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 20
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                        }
                    }
                    console.log(newEvent);
                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 1000)
                }
            }
        }


        ReactDOM.render(
            <ScheduleControlPopup
                device_type={"Add Schedule: " + slotName}
                event_rrule={newEvent.rrule}
                event_start={newEvent.start}
                event_end={newEvent.end}
                event_name={newEvent.title}
                okButtonClicked={okButtonClicked}
                closeButtonClicked={closeButtonClicked}
                deleteButtonClicked={deleteButtonClicked}
            />, document.getElementById("popup-container-schedule")
        )
    }

    updateEventStart = (schedulerData, event, newStart) => {
        var old_start = event.start;
        schedulerData.updateEventStart(event, newStart);
        event.title = event.title.substring(0, event.title.length - 22) + " (" + from24to12(moment(newStart).format('HH:mm')) + " - " + from24to12(moment(event.end).format('HH:mm')) + ")";
        this.setState({
            viewModel: schedulerData
        })

        function closeButtonClicked() {
            // Update database (Update)
            window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
            window.calendar.props.refetchData();

            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }
        function deleteButtonClicked() {
            // Update calendar
            schedulerData.removeEvent(event);
            window.calendar.setState({
                viewModel: schedulerData
            })

            // Update database
            window.calendar.props.onDeleteClick(event.database_id);
            window.calendar.props.refetchData();

            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }

        function okButtonClicked() {
            var check_start_time = "2020-01-01 " + from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
            var check_end_time = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)
            if (check_end_time === "00:00:00") {
                check_end_time = "2020-01-02 " + check_end_time
            } else {
                check_end_time = "2020-01-01 " + check_end_time
            }
            if (check_start_time >= check_end_time) {
                ReactDOM.render(
                    <OnlyAlert
                        message="Check your timings! Start time should be before end time."
                        onOK={function() {
                            ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                        }}
                    />, document.getElementById("confirm-alert")
                )
            } else {
                // Checking conflicts
                var hasConflict = false;
                var conflictedEvents = [];
                var plugload_option = document.querySelectorAll('input[name="ScheduleApplyOption"]:checked');
                var repeat_option = document.querySelectorAll('input[name="ScheduleRepeatOption"]:checked');
                var new_days_to_loop_over = [];
                for (var repeat_day of repeat_option) {
                    if (repeat_day === document.getElementById("ScheduleRepeatMonday")) {
                        new_days_to_loop_over.push(getDates()[0])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatTuesday")) {
                        new_days_to_loop_over.push(getDates()[1])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatWednesday")) {
                        new_days_to_loop_over.push(getDates()[2])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatThursday")) {
                        new_days_to_loop_over.push(getDates()[3])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatFriday")) {
                        new_days_to_loop_over.push(getDates()[4])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSaturday")) {
                        new_days_to_loop_over.push(getDates()[5])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSunday")) {
                        new_days_to_loop_over.push(getDates()[6])
                    }
                }

                var new_start = from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
                var new_end = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)

                var new_start_for_this = "";
                var new_end_for_this = "";
                var existing_start_for_this = "";
                var existing_end_for_this = "";
                for (var new_day of new_days_to_loop_over) {
                    new_start_for_this = new_day + " " + new_start;
                    new_end_for_this = new_day + " " + new_end;
                    for (var plugload of plugload_option) {
                        schedulerData.events.forEach(function(e) {
                            var current_resource_id = 0
                            if (plugload === document.getElementById("ScheduleApplyDesktop")) {
                                current_resource_id = 1
                            }
                            if (plugload === document.getElementById("ScheduleApplyLaptop")) {
                                current_resource_id = 2
                            }
                            if (plugload === document.getElementById("ScheduleApplyMonitor")) {
                                current_resource_id = 3
                            }
                            if (plugload === document.getElementById("ScheduleApplyTaskLamp")) {
                                current_resource_id = 4
                            }
                            if (plugload === document.getElementById("ScheduleApplyFan")) {
                                current_resource_id = 5
                            }
                            if (e.resourceId === current_resource_id) {
                                var existing_days_to_loop_over = [];
                                if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                    existing_days_to_loop_over.push(getDates()[0])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                    existing_days_to_loop_over.push(getDates()[1])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                    existing_days_to_loop_over.push(getDates()[2])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                    existing_days_to_loop_over.push(getDates()[3])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                    existing_days_to_loop_over.push(getDates()[4])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                    existing_days_to_loop_over.push(getDates()[5])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                    existing_days_to_loop_over.push(getDates()[6])
                                }

                                for (var existing_day of existing_days_to_loop_over) {
                                    existing_start_for_this = existing_day + e.start.substring(10,19);
                                    existing_end_for_this = existing_day + e.end.substring(10,19);
                                    if (((new_start_for_this >= existing_start_for_this &&
                                          new_start_for_this < existing_end_for_this) || (
                                          new_end_for_this > existing_start_for_this &&
                                          new_end_for_this <= existing_end_for_this) || (
                                          existing_start_for_this >= new_start_for_this &&
                                          existing_start_for_this < new_end_for_this) || (
                                          existing_end_for_this > new_start_for_this &&
                                          existing_end_for_this <= new_end_for_this)) && (
                                          e.id !== event.id)) {
                                            hasConflict = true;
                                            if (!conflictedEvents.includes(e)) {
                                                conflictedEvents.push(e)
                                            }
                                          }
                                }
                            }
                        })
                    }
                }

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                            day =  day + "Monday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                            day = day + "Tuesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                            day = day + "Wednesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                            day = day + "Thursday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                            day = day + "Friday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                            day = day + "Saturday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                            day = day + "Sunday, "
                        }
                        var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
                        message += `<new>- ${events.title} for ${current_plugload_conflicted} on ${day.substring(0,day.length-2)}`
                    }
                    ReactDOM.render(
                        <ConflictAlert
                            message={message}
                            onOK={function() {
                                ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                            }}
                        />, document.getElementById("confirm-alert")
                    )
                } else {
                    // Rename
                    event.title = document.getElementById("schedule_name_input").value + " (" +
                                  document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " +
                                  document.getElementById("StartAMPM").value + " - " + document.getElementById("EndHour").value + ":" +
                                  document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value + ")";

                    // Update start
                    schedulerData.updateEventStart(event, window.calendar.props.date + " " + processHourInput("Start") + ":" + document.getElementById("StartMinute").value + ":00");

                    // Update end
                    schedulerData.updateEventEnd(event, window.calendar.props.date + " " + processHourInput("End") + ":" + document.getElementById("EndMinute").value + ":00")

                    // Update repeat
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.mondayDate.substring(0,4) +
                                      window.calendar.props.mondayDate.substring(5,7) +
                                      window.calendar.props.mondayDate.substring(8,10) + "T000000Z;UNTIL=" +
                                      window.calendar.props.sundayDate.substring(0,4) +
                                      window.calendar.props.sundayDate.substring(5,7) +
                                      window.calendar.props.sundayDate.substring(8,10) + "T235900Z;BYDAY="
                    if (document.getElementById("ScheduleRepeatEveryDay").checked) {
                        // Repeat Every Day
                        event.rrule = event_rrule + "MO,TU,WE,TH,FR,SA,SU";
                    } else {
                        if (document.getElementById("ScheduleRepeatMonday").checked) {
                            event_rrule = event_rrule + "MO,"
                        }
                        if (document.getElementById("ScheduleRepeatTuesday").checked) {
                            event_rrule = event_rrule + "TU,"
                        }
                        if (document.getElementById("ScheduleRepeatWednesday").checked) {
                            event_rrule = event_rrule + "WE,"
                        }
                        if (document.getElementById("ScheduleRepeatThursday").checked) {
                            event_rrule = event_rrule + "TH,"
                        }
                        if (document.getElementById("ScheduleRepeatFriday").checked) {
                            event_rrule = event_rrule + "FR,"
                        }
                        if (document.getElementById("ScheduleRepeatSaturday").checked) {
                            event_rrule = event_rrule + "SA,"
                        }
                        if (document.getElementById("ScheduleRepeatSunday").checked) {
                            event_rrule = event_rrule + "SU,"
                        }
                        event.rrule = event_rrule.substring(0,event_rrule.length-1)
                    }

                    // Apply to other devices
                    document.getElementById("ScheduleApply" + slotName.replace(/\s/g, '')).checked = false;
                    var newFreshId = 0;
                    schedulerData.events.forEach(item => {
                        if (item.database_id >= newFreshId || item.id >= newFreshId) {
                            newFreshId = item.database_id;
                        }
                    })

                    if (document.getElementById("ScheduleApplyDesktop").checked) {
                        newFreshId = newFreshId + 1;
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 1,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyMonitor").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 3,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyLaptop").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 2,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyTaskLamp").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 4,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyFan").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 5,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));



                    // Update weekly achievement
                    if (window.calendar.state.weekly_achievements_books[0].schedule_based === 0) {
                        window.calendar.setState({
                            weekly_achievements_books: [
                                {
                                    ...window.calendar.state.weekly_achievements_books[0],
                                    schedule_based: 20
                                }
                            ]
                        }, function() {window.calendar.handleWeeklyAchievementsFormSubmit()})
                        // If first time clicking, update achievement
                        if (window.calendar.state.achievements_books[0].first_schedule === 0) {
                            window.calendar.setState({
                                achievements_books: [
                                    {
                                        ...window.calendar.state.achievements_books[0],
                                        first_schedule: 70
                                    }
                                ]
                            }, function() {window.calendar.handleAchievementsFormSubmit()})
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 90
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                            window.presencecontrol.setState({key: window.presencecontrol.state.key + 1})
                        } else {
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 20
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                        }
                    }
                    console.log(event);
                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 1000)
                }
            }
        }

        var slotName = schedulerData.getSlotById(event.resourceId).name;
        ReactDOM.render(
            <ScheduleControlPopup
                device_type={"Edit Schedule: " + slotName}
                event_rrule={event.rrule}
                event_start={newStart}
                event_end={event.end}
                event_name={event.title}
                okButtonClicked={okButtonClicked}
                closeButtonClicked={closeButtonClicked}
                deleteButtonClicked={deleteButtonClicked}
            />, document.getElementById("popup-container-schedule")
        )
    }

    updateEventEnd = (schedulerData, event, newEnd) => {
        var old_end = event.end;
        schedulerData.updateEventEnd(event, newEnd);
        event.title = event.title.substring(0, event.title.length - 22) + " (" + from24to12(moment(event.start).format('HH:mm')) + " - " + from24to12(moment(newEnd).format('HH:mm')) + ")";
        this.setState({
            viewModel: schedulerData
        })

        function closeButtonClicked() {
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

            // Update database (Update)
            window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
            window.calendar.props.refetchData();
        }
        function deleteButtonClicked() {
            // Update database (Delete)
            window.calendar.props.onDeleteClick(event.database_id)
            window.calendar.props.refetchData();

            // Update calendar
            schedulerData.removeEvent(event);
            window.calendar.setState({
                viewModel: schedulerData
            })
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }

        function okButtonClicked() {
            var check_start_time = "2020-01-01 " + from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
            var check_end_time = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)
            if (check_end_time === "00:00:00") {
                check_end_time = "2020-01-02 " + check_end_time
            } else {
                check_end_time = "2020-01-01 " + check_end_time
            }
            if (check_start_time >= check_end_time) {
                ReactDOM.render(
                    <OnlyAlert
                        message="Check your timings! Start time should be before end time."
                        onOK={function() {
                            ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                        }}
                    />, document.getElementById("confirm-alert")
                )
            } else {
                // Checking conflicts
                var hasConflict = false;
                var conflictedEvents = [];
                var plugload_option = document.querySelectorAll('input[name="ScheduleApplyOption"]:checked');
                var repeat_option = document.querySelectorAll('input[name="ScheduleRepeatOption"]:checked');
                var new_days_to_loop_over = [];
                for (var repeat_day of repeat_option) {
                    if (repeat_day === document.getElementById("ScheduleRepeatMonday")) {
                        new_days_to_loop_over.push(getDates()[0])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatTuesday")) {
                        new_days_to_loop_over.push(getDates()[1])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatWednesday")) {
                        new_days_to_loop_over.push(getDates()[2])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatThursday")) {
                        new_days_to_loop_over.push(getDates()[3])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatFriday")) {
                        new_days_to_loop_over.push(getDates()[4])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSaturday")) {
                        new_days_to_loop_over.push(getDates()[5])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSunday")) {
                        new_days_to_loop_over.push(getDates()[6])
                    }
                }

                var new_start = from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
                var new_end = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)

                var new_start_for_this = "";
                var new_end_for_this = "";
                var existing_start_for_this = "";
                var existing_end_for_this = "";
                for (var new_day of new_days_to_loop_over) {
                    new_start_for_this = new_day + " " + new_start;
                    new_end_for_this = new_day + " " + new_end;
                    for (var plugload of plugload_option) {
                        schedulerData.events.forEach(function(e) {
                            var current_resource_id = 0
                            if (plugload === document.getElementById("ScheduleApplyDesktop")) {
                                current_resource_id = 1
                            }
                            if (plugload === document.getElementById("ScheduleApplyLaptop")) {
                                current_resource_id = 2
                            }
                            if (plugload === document.getElementById("ScheduleApplyMonitor")) {
                                current_resource_id = 3
                            }
                            if (plugload === document.getElementById("ScheduleApplyTaskLamp")) {
                                current_resource_id = 4
                            }
                            if (plugload === document.getElementById("ScheduleApplyFan")) {
                                current_resource_id = 5
                            }
                            if (e.resourceId === current_resource_id) {
                                var existing_days_to_loop_over = [];
                                if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                    existing_days_to_loop_over.push(getDates()[0])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                    existing_days_to_loop_over.push(getDates()[1])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                    existing_days_to_loop_over.push(getDates()[2])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                    existing_days_to_loop_over.push(getDates()[3])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                    existing_days_to_loop_over.push(getDates()[4])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                    existing_days_to_loop_over.push(getDates()[5])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                    existing_days_to_loop_over.push(getDates()[6])
                                }

                                for (var existing_day of existing_days_to_loop_over) {
                                    existing_start_for_this = existing_day + e.start.substring(10,19);
                                    existing_end_for_this = existing_day + e.end.substring(10,19);
                                    if (((new_start_for_this >= existing_start_for_this &&
                                          new_start_for_this < existing_end_for_this) || (
                                          new_end_for_this > existing_start_for_this &&
                                          new_end_for_this <= existing_end_for_this) || (
                                          existing_start_for_this >= new_start_for_this &&
                                          existing_start_for_this < new_end_for_this) || (
                                          existing_end_for_this > new_start_for_this &&
                                          existing_end_for_this <= new_end_for_this)) && (
                                          e.id !== event.id)) {
                                            hasConflict = true;
                                            if (!conflictedEvents.includes(e)) {
                                                conflictedEvents.push(e)
                                            }
                                          }
                                }
                            }
                        })
                    }
                }

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                            day = day + "Monday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                            day = day + "Tuesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                            day = day + "Wednesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                            day = day + "Thursday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                            day = day + "Friday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                            day = day + "Saturday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                            day = day + "Sunday, "
                        }
                        var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
                        message += `<new>- ${events.title} for ${current_plugload_conflicted} on ${day.substring(0,day.length-2)}`
                    }
                    ReactDOM.render(
                        <ConflictAlert
                            message={message}
                            onOK={function() {
                                ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                            }}
                        />, document.getElementById("confirm-alert")
                    )
                } else {
                    // Rename
                    event.title = document.getElementById("schedule_name_input").value + " (" +
                                  document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " +
                                  document.getElementById("StartAMPM").value + " - " + document.getElementById("EndHour").value + ":" +
                                  document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value + ")";

                    // Update start
                    schedulerData.updateEventStart(event, window.calendar.props.date + " " + processHourInput("Start") + ":" + document.getElementById("StartMinute").value + ":00");

                    // Update end
                    schedulerData.updateEventEnd(event, window.calendar.props.date + " " + processHourInput("End") + ":" + document.getElementById("EndMinute").value + ":00")

                    // Update repeat
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.mondayDate.substring(0,4) +
                                      window.calendar.props.mondayDate.substring(5,7) +
                                      window.calendar.props.mondayDate.substring(8,10) + "T000000Z;UNTIL=" +
                                      window.calendar.props.sundayDate.substring(0,4) +
                                      window.calendar.props.sundayDate.substring(5,7) +
                                      window.calendar.props.sundayDate.substring(8,10) + "T235900Z;BYDAY="
                    if (document.getElementById("ScheduleRepeatEveryDay").checked) {
                        // Repeat Every Day
                        event.rrule = event_rrule + "MO,TU,WE,TH,FR,SA,SU";
                    } else {
                        if (document.getElementById("ScheduleRepeatMonday").checked) {
                            event_rrule = event_rrule + "MO,"
                        }
                        if (document.getElementById("ScheduleRepeatTuesday").checked) {
                            event_rrule = event_rrule + "TU,"
                        }
                        if (document.getElementById("ScheduleRepeatWednesday").checked) {
                            event_rrule = event_rrule + "WE,"
                        }
                        if (document.getElementById("ScheduleRepeatThursday").checked) {
                            event_rrule = event_rrule + "TH,"
                        }
                        if (document.getElementById("ScheduleRepeatFriday").checked) {
                            event_rrule = event_rrule + "FR,"
                        }
                        if (document.getElementById("ScheduleRepeatSaturday").checked) {
                            event_rrule = event_rrule + "SA,"
                        }
                        if (document.getElementById("ScheduleRepeatSunday").checked) {
                            event_rrule = event_rrule + "SU,"
                        }
                        event.rrule = event_rrule.substring(0,event_rrule.length-1)
                    }

                    // Apply to other devices
                    document.getElementById("ScheduleApply" + slotName.replace(/\s/g, '')).checked = false;
                    let newFreshId = 0;
                    schedulerData.events.forEach(item => {
                        if (item.database_id >= newFreshId || item.id >= newFreshId) {
                            newFreshId = item.database_id;
                        }
                    })
                    if (document.getElementById("ScheduleApplyDesktop").checked) {
                        newFreshId = newFreshId + 1;
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 1,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyMonitor").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 3,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyLaptop").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 2,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyTaskLamp").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 4,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyFan").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 5,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Update weekly achievement
                    if (window.calendar.state.weekly_achievements_books[0].schedule_based === 0) {
                        window.calendar.setState({
                            weekly_achievements_books: [
                                {
                                    ...window.calendar.state.weekly_achievements_books[0],
                                    schedule_based: 20
                                }
                            ]
                        }, function() {window.calendar.handleWeeklyAchievementsFormSubmit()})
                        // If first time clicking, update achievement
                        if (window.calendar.state.achievements_books[0].first_schedule === 0) {
                            window.calendar.setState({
                                achievements_books: [
                                    {
                                        ...window.calendar.state.achievements_books[0],
                                        first_schedule: 70
                                    }
                                ]
                            }, function() {window.calendar.handleAchievementsFormSubmit()})
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 90
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                            window.presencecontrol.setState({key: window.presencecontrol.state.key + 1})
                        } else {
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 20
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                        }
                    }
                    console.log(event);
                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 1000)
                }
            }
        }


        var slotName = schedulerData.getSlotById(event.resourceId).name;
        ReactDOM.render(
            <ScheduleControlPopup
                device_type={"Edit Schedule: " + slotName}
                event_rrule={event.rrule}
                event_start={event.start}
                event_end={newEnd}
                event_name={event.title}
                okButtonClicked={okButtonClicked}
                closeButtonClicked={closeButtonClicked}
                deleteButtonClicked={deleteButtonClicked}
            />, document.getElementById("popup-container-schedule")
        )
    }

    moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
        var old_start = event.start;
        var old_end = event.end;
        schedulerData.updateEventStart(event, start);
        schedulerData.updateEventEnd(event, end);
        event.title = event.title.substring(0, event.title.length - 22) + " (" + from24to12(moment(start).format('HH:mm')) + " - " + from24to12(moment(end).format('HH:mm')) + ")";
        this.setState({
            viewModel: schedulerData
        })

        function closeButtonClicked() {
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

            // Update database (Update)
            window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
            window.calendar.props.refetchData();
        }

        function deleteButtonClicked() {
            // Update database (Delete)
            window.calendar.props.onDeleteClick(event.database_id);
            window.calendar.props.refetchData();

            // Update calendar
            schedulerData.removeEvent(event);
            window.calendar.setState({
                viewModel: schedulerData
            })
            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));
        }

        function okButtonClicked() {
            var check_start_time = "2020-01-01 " + from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
            var check_end_time = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)
            if (check_end_time === "00:00:00") {
                check_end_time = "2020-01-02 " + check_end_time
            } else {
                check_end_time = "2020-01-01 " + check_end_time
            }
            if (check_start_time >= check_end_time) {
                ReactDOM.render(
                    <OnlyAlert
                        message="Check your timings! Start time should be before end time."
                        onOK={function() {
                            ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                        }}
                    />, document.getElementById("confirm-alert")
                )
            } else {
                // Checking conflicts
                var hasConflict = false;
                var conflictedEvents = [];
                var plugload_option = document.querySelectorAll('input[name="ScheduleApplyOption"]:checked');
                var repeat_option = document.querySelectorAll('input[name="ScheduleRepeatOption"]:checked');
                var new_days_to_loop_over = [];
                for (var repeat_day of repeat_option) {
                    if (repeat_day === document.getElementById("ScheduleRepeatMonday")) {
                        new_days_to_loop_over.push(getDates()[0])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatTuesday")) {
                        new_days_to_loop_over.push(getDates()[1])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatWednesday")) {
                        new_days_to_loop_over.push(getDates()[2])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatThursday")) {
                        new_days_to_loop_over.push(getDates()[3])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatFriday")) {
                        new_days_to_loop_over.push(getDates()[4])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSaturday")) {
                        new_days_to_loop_over.push(getDates()[5])
                    }
                    if (repeat_day === document.getElementById("ScheduleRepeatSunday")) {
                        new_days_to_loop_over.push(getDates()[6])
                    }
                }

                var new_start = from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value)
                var new_end = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)

                var new_start_for_this = "";
                var new_end_for_this = "";
                var existing_start_for_this = "";
                var existing_end_for_this = "";
                for (var new_day of new_days_to_loop_over) {
                    new_start_for_this = new_day + " " + new_start;
                    new_end_for_this = new_day + " " + new_end;
                    for (var plugload of plugload_option) {
                        schedulerData.events.forEach(function(e) {
                            var current_resource_id = 0
                            if (plugload === document.getElementById("ScheduleApplyDesktop")) {
                                current_resource_id = 1
                            }
                            if (plugload === document.getElementById("ScheduleApplyLaptop")) {
                                current_resource_id = 2
                            }
                            if (plugload === document.getElementById("ScheduleApplyMonitor")) {
                                current_resource_id = 3
                            }
                            if (plugload === document.getElementById("ScheduleApplyTaskLamp")) {
                                current_resource_id = 4
                            }
                            if (plugload === document.getElementById("ScheduleApplyFan")) {
                                current_resource_id = 5
                            }
                            if (e.resourceId === current_resource_id) {
                                var existing_days_to_loop_over = [];
                                if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                    existing_days_to_loop_over.push(getDates()[0])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                    existing_days_to_loop_over.push(getDates()[1])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                    existing_days_to_loop_over.push(getDates()[2])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                    existing_days_to_loop_over.push(getDates()[3])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                    existing_days_to_loop_over.push(getDates()[4])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                    existing_days_to_loop_over.push(getDates()[5])
                                }
                                if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                    existing_days_to_loop_over.push(getDates()[6])
                                }

                                for (var existing_day of existing_days_to_loop_over) {
                                    existing_start_for_this = existing_day + e.start.substring(10,19);
                                    existing_end_for_this = existing_day + e.end.substring(10,19);
                                    if (((new_start_for_this >= existing_start_for_this &&
                                          new_start_for_this < existing_end_for_this) || (
                                          new_end_for_this > existing_start_for_this &&
                                          new_end_for_this <= existing_end_for_this) || (
                                          existing_start_for_this >= new_start_for_this &&
                                          existing_start_for_this < new_end_for_this) || (
                                          existing_end_for_this > new_start_for_this &&
                                          existing_end_for_this <= new_end_for_this)) && (
                                          e.id !== event.id)) {
                                            hasConflict = true;
                                            if (!conflictedEvents.includes(e)) {
                                                conflictedEvents.push(e)
                                            }
                                          }
                                }
                            }
                        })
                    }
                }

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                            day = day + "Monday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                            day = day + "Tuesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                            day = day + "Wednesday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                            day = day + "Thursday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                            day = day + "Friday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                            day = day + "Saturday, "
                        }
                        if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                            day = day + "Sunday, "
                        }
                        var current_plugload_conflicted = schedulerData.getSlotById(events.resourceId).name
                        message += `<new>- ${events.title} for ${current_plugload_conflicted} on ${day.substring(0,day.length-2)}`
                    }
                    ReactDOM.render(
                        <ConflictAlert
                            message={message}
                            onOK={function() {
                                ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                            }}
                        />, document.getElementById("confirm-alert")
                    )
                } else {
                    // Rename
                    event.title = document.getElementById("schedule_name_input").value + " (" +
                                  document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " +
                                  document.getElementById("StartAMPM").value + " - " + document.getElementById("EndHour").value + ":" +
                                  document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value + ")";

                    // Update start
                    schedulerData.updateEventStart(event, window.calendar.props.date + " " + processHourInput("Start") + ":" + document.getElementById("StartMinute").value + ":00");

                    // Update end
                    schedulerData.updateEventEnd(event, window.calendar.props.date + " " + processHourInput("End") + ":" + document.getElementById("EndMinute").value + ":00")

                    // Update repeat
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.mondayDate.substring(0,4) +
                                      window.calendar.props.mondayDate.substring(5,7) +
                                      window.calendar.props.mondayDate.substring(8,10) + "T000000Z;UNTIL=" +
                                      window.calendar.props.sundayDate.substring(0,4) +
                                      window.calendar.props.sundayDate.substring(5,7) +
                                      window.calendar.props.sundayDate.substring(8,10) + "T235900Z;BYDAY="
                    if (document.getElementById("ScheduleRepeatEveryDay").checked) {
                        // Repeat Every Day
                        event.rrule = event_rrule + "MO,TU,WE,TH,FR,SA,SU";
                    } else {
                        if (document.getElementById("ScheduleRepeatMonday").checked) {
                            event_rrule = event_rrule + "MO,"
                        }
                        if (document.getElementById("ScheduleRepeatTuesday").checked) {
                            event_rrule = event_rrule + "TU,"
                        }
                        if (document.getElementById("ScheduleRepeatWednesday").checked) {
                            event_rrule = event_rrule + "WE,"
                        }
                        if (document.getElementById("ScheduleRepeatThursday").checked) {
                            event_rrule = event_rrule + "TH,"
                        }
                        if (document.getElementById("ScheduleRepeatFriday").checked) {
                            event_rrule = event_rrule + "FR,"
                        }
                        if (document.getElementById("ScheduleRepeatSaturday").checked) {
                            event_rrule = event_rrule + "SA,"
                        }
                        if (document.getElementById("ScheduleRepeatSunday").checked) {
                            event_rrule = event_rrule + "SU,"
                        }
                        event.rrule = event_rrule.substring(0,event_rrule.length-1)
                    }

                    // Apply to other devices
                    var newFreshId = 0;
                    schedulerData.events.forEach(item => {
                        if (item.database_id >= newFreshId || item.id >= newFreshId) {
                            newFreshId = item.database_id;
                        }
                    })
                    document.getElementById("ScheduleApply" + slotName.replace(/\s/g, '')).checked = false;
                    if (document.getElementById("ScheduleApplyDesktop").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 1,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyMonitor").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 3,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyLaptop").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 2,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyTaskLamp").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 4,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }
                    if (document.getElementById("ScheduleApplyFan").checked) {
                        newFreshId = newFreshId + 1
                        let newEvent = {
                            id: newFreshId,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            resourceId: 5,
                            bgColor: "#06D6A0",
                            showPopover: false,
                            rrule: event.rrule
                        }
                        window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                        schedulerData.addEvent(newEvent);
                        window.calendar.setState({
                            viewModel: schedulerData
                        })
                    }

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Update weekly achievement
                    if (window.calendar.state.weekly_achievements_books[0].schedule_based === 0) {
                        window.calendar.setState({
                            weekly_achievements_books: [
                                {
                                    ...window.calendar.state.weekly_achievements_books[0],
                                    schedule_based: 20
                                }
                            ]
                        }, function() {window.calendar.handleWeeklyAchievementsFormSubmit()})
                        // If first time clicking, update achievement
                        if (window.calendar.state.achievements_books[0].first_schedule === 0) {
                            window.calendar.setState({
                                achievements_books: [
                                    {
                                        ...window.calendar.state.achievements_books[0],
                                        first_schedule: 70
                                    }
                                ]
                            }, function() {window.calendar.handleAchievementsFormSubmit()})
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 90
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                            window.presencecontrol.setState({key: window.presencecontrol.state.key + 1})
                        } else {
                            window.calendar.setState({
                                points_wallet_books: [
                                    {
                                        ...window.calendar.state.points_wallet_books[0],
                                        points: window.calendar.state.points_wallet_books[0].points + 20
                                    }
                                ]
                            }, function() {window.calendar.handlePointsWalletFormSubmit()})
                        }
                    }
                    console.log(event);
                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 1000)
                }
            }
        }


        ReactDOM.render(
            <ScheduleControlPopup
                device_type={"Edit Schedule: " + slotName}
                event_rrule={event.rrule}
                event_start={start}
                event_end={end}
                event_name={event.title}
                okButtonClicked={okButtonClicked}
                closeButtonClicked={closeButtonClicked}
                deleteButtonClicked={deleteButtonClicked}
            />, document.getElementById("popup-container-schedule")
        )
    }

    conflictOccurred = (schedulerData, action, event, type, slotId, slotName, start, end) => {
        ReactDOM.render(
            <OnlyAlert
                message={"This is conflicting with a schedule set for " + slotName + "."}
                onOK={function() {
                    ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"))
                }}
            />, document.getElementById("confirm-alert")
        )
    }

}

export default withDragDropContext(Calendar);