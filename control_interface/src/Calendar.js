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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length+1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length+1));
                break;
            }
        }
    }
    return cookieValue
}

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
            event_rrule = event_rrule + "MondayMorning, "
        } else {
            event_rrule = event_rrule + "Monday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "TuesdayMorning, "
        } else {
            event_rrule = event_rrule + "Tuesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("WE")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "WednesdayMorning, "
        } else {
            event_rrule = event_rrule + "Wednesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TH")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "ThursdayMorning, "
        } else {
            event_rrule = event_rrule + "Thursday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("FR")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "FridayMorning, "
        } else {
            event_rrule = event_rrule + "Friday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SA")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "SaturdayMorning, "
        } else {
            event_rrule = event_rrule + "Saturday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "SundayMorning, "
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
            event_rrule = event_rrule + "MondayMorning, "
        } else {
            event_rrule = event_rrule + "Monday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "TuesdayMorning, "
        } else {
            event_rrule = event_rrule + "Tuesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("WE")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "WednesdayMorning, "
        } else {
            event_rrule = event_rrule + "Wednesday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("TH")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "ThursdayMorning, "
        } else {
            event_rrule = event_rrule + "Thursday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("FR")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "FridayMorning, "
        } else {
            event_rrule = event_rrule + "Friday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SA")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "SaturdayMorning, "
        } else {
            event_rrule = event_rrule + "Saturday, "
        }
    }
    if (book.rrule.substring(60,book.rrule.length).includes("SU")) {
        if (book.start.substring(book.start.length-8, book.start.length) < "08:00:00") {
            event_rrule = event_rrule + "SundayMorning, "
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
    var startDate = new Date();

    if (today.getDay() === 0) {
        // Today is Sunday
        startDate.setDate(today.getDate() - 7)
        mondayDate.setDate(today.getDate() - 6);
        tuesdayDate.setDate(today.getDate() - 5);
        wednesdayDate.setDate(today.getDate() - 4);
        thursdayDate.setDate(today.getDate() - 3);
        fridayDate.setDate(today.getDate() - 2);
        saturdayDate.setDate(today.getDate() - 1);
        sundayDate.setDate(today.getDate());
    } else {
        startDate.setDate(today.getDate() + (0 - today.getDay()))
        mondayDate.setDate(today.getDate() + (1 - today.getDay()));
        tuesdayDate.setDate(today.getDate() + (2 - today.getDay()));
        wednesdayDate.setDate(today.getDate() + (3 - today.getDay()));
        thursdayDate.setDate(today.getDate() + (4 - today.getDay()));
        fridayDate.setDate(today.getDate() + (5 - today.getDay()));
        saturdayDate.setDate(today.getDate() + (6 - today.getDay()));
        sundayDate.setDate(today.getDate() + (7 - today.getDay()));
    }

    startDate = startDate.getFullYear() + "-" + ((startDate.getMonth() + 1).toString().length === 1 ? "0" + (startDate.getMonth() + 1).toString() : (startDate.getMonth() + 1)) + "-" + (startDate.getDate().toString().length === 1 ? "0" + startDate.getDate().toString() : startDate.getDate())
    mondayDate = mondayDate.getFullYear() + "-" + ((mondayDate.getMonth() + 1).toString().length === 1 ? "0" + (mondayDate.getMonth() + 1).toString() : (mondayDate.getMonth() + 1)) + "-" + (mondayDate.getDate().toString().length === 1 ? "0" + mondayDate.getDate().toString() : mondayDate.getDate())
    tuesdayDate = tuesdayDate.getFullYear() + "-" + ((tuesdayDate.getMonth() + 1).toString().length === 1 ? "0" + (tuesdayDate.getMonth() + 1).toString() : (tuesdayDate.getMonth() + 1)) + "-" + (tuesdayDate.getDate().toString().length === 1 ? "0" + tuesdayDate.getDate().toString() : tuesdayDate.getDate())
    wednesdayDate = wednesdayDate.getFullYear() + "-" + ((wednesdayDate.getMonth() + 1).toString().length === 1 ? "0" + (wednesdayDate.getMonth() + 1).toString() : (wednesdayDate.getMonth() + 1)) + "-" + (wednesdayDate.getDate().toString().length === 1 ? "0" + wednesdayDate.getDate().toString() : wednesdayDate.getDate())
    thursdayDate = thursdayDate.getFullYear() + "-" + ((thursdayDate.getMonth() + 1).toString().length === 1 ? "0" + (thursdayDate.getMonth() + 1).toString() : (thursdayDate.getMonth() + 1))  + "-" + (thursdayDate.getDate().toString().length === 1 ? "0" + thursdayDate.getDate().toString() : thursdayDate.getDate())
    fridayDate = fridayDate.getFullYear() + "-" + ((fridayDate.getMonth() + 1).toString().length === 1 ? "0" + (fridayDate.getMonth() + 1).toString() : (fridayDate.getMonth() + 1)) + "-" + (fridayDate.getDate().toString().length === 1 ? "0" + fridayDate.getDate().toString() : fridayDate.getDate())
    saturdayDate = saturdayDate.getFullYear() + "-" + ((saturdayDate.getMonth() + 1).toString().length === 1 ? "0" + (saturdayDate.getMonth() + 1).toString() : (saturdayDate.getMonth() + 1)) + "-" + (saturdayDate.getDate().toString().length === 1 ? "0" + saturdayDate.getDate().toString() : saturdayDate.getDate())
    sundayDate = sundayDate.getFullYear() + "-" + ((sundayDate.getMonth() + 1).toString().length === 1 ? "0" + (sundayDate.getMonth() + 1).toString() : (sundayDate.getMonth() + 1)) + "-" + (sundayDate.getDate().toString().length === 1 ? "0" + sundayDate.getDate().toString() : sundayDate.getDate())

    return([mondayDate, tuesdayDate, wednesdayDate, thursdayDate, fridayDate, saturdayDate, sundayDate, startDate])
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
        schedulerData.setResources(this.props.devices);
        schedulerData.setEvents(this.props.events);

        this.state = {
            viewModel: schedulerData,
            achievements_books: [],
            weekly_achievements_books: [],
            points_wallet_books: [],
            daily_achievements_books: [],
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

    updateAchievementsBooks = (newBook) => {
        fetch('/control_interface/api/achievements_bonus/' + newBook.id.toString() + '/', {
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
        fetch('/control_interface/api/achievements_weekly/' + newBook.id.toString() + '/', {
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

    updateDailyAchievementsBooks = (newBook) => {
        fetch('/control_interface/api/achievements_daily/' + newBook.id.toString() + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        }).then(response => response.json())
        .then(newBook => {
            const newBooks = this.state.daily_achievements_books.map(book => {
                if (book.id === newBook.id) {
                    return Object.assign({}, newBook);
                } else {
                    return book;
                }
            });
            this.setState({daily_achievements_books: newBooks})
        })
    }

    updatePointsWalletBooks = (newBook) => {
        fetch('/control_interface/api/points_wallet/' + newBook.id.toString() + '/', {
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

    handleDailyAchievementsUpdate = (book) => {
        this.updateDailyAchievementsBooks(book);
    }

    handlePointsWalletUpdate = (book) => {
        book.id = this.props.current_user_id;
        this.updatePointsWalletBooks(book);
    }

    updateScheduleAchievements = () => {
        fetch('/control_interface/api/achievements_bonus/')
        .then(response => response.json())
        .then(bonus_data => {
            this.setState({achievements_books: bonus_data}, function() {
                if (bonus_data[0].first_schedule === 0) {
                    // First schedule achievement completed
                    bonus_data[0].first_schedule = 70
                    this.handleAchievementsUpdate(bonus_data[0])

                    fetch('/control_interface/api/points_wallet/')
                    .then(response => response.json())
                    .then(points_data => {
                        this.setState({points_wallet_books: points_data}, function() {
                            points_data[0].points = points_data[0].points + 70
                            this.handlePointsWalletUpdate(points_data[0])
                        })
                    })

                    // Add achievement to user log
                    var now_unix_time = Math.round((new Date()).getTime() / 1000);
                    const csrftoken = getCookie('csrftoken');
                    fetch('/control_interface/api/user_log/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken
                        },
                        body: JSON.stringify({user_id: bonus_data[0].user_id, type: "achievement", unix_time: now_unix_time, description: "first_schedule"})
                    })

                    // Send notification
                    fetch('/control_interface/api/notifications/')
                    .then(response => response.json())
                    .then(notifications_data => {
                        var number_of_notifications = notifications_data[0].notifications.notifications.length;
                        var current_user = notifications_data[0].user_id;

                        // Get the timestamp
                        var today = new Date();
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        var new_timestamp = today.getDate() + " " + months[today.getMonth()] + " " + today.getUTCFullYear() + ", " + days[today.getDay()];
                        notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have earned 70 points for using schedule-based control for the first time.", type: "success"})
                        fetch('/control_interface/api/notifications/' + current_user.toString() + '/', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(notifications_data[0])
                        })

                        // Update number on bell
                        document.getElementById("number_of_notifications").innerHTML = (number_of_notifications + 1)

                        // Update notifications in list
                        document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have earned 70 points for using schedule-based control for the first time. </span> </div> </a>`)

                        // Animate the bell
                        document.getElementById("bell_icon").style.animationIterationCount = "infinite";
                    })
                }
            })
        })
    }

    updateDailyScheduleAchievements = () => {
        fetch('/control_interface/api/achievements_daily')
        .then(response => response.json())
        .then(daily_data => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            this.setState({daily_achievements_books: daily_data}, function() {
                for (var input of daily_data) {
                    if (input.week_day === days[(new Date()).getDay()]) {
                        if (input.daily_schedule === 0) {
                            // Daily schedule achievement completed
                            input.daily_schedule = 5;
                            this.handleDailyAchievementsUpdate(input);

                            // Add points to wallet
                            fetch('/control_interface/api/points_wallet/')
                            .then(response => response.json())
                            .then(points_data => {
                                this.setState({points_wallet_books: points_data}, function() {
                                    points_data[0].points = points_data[0].points + 5;
                                    this.handlePointsWalletUpdate(points_data[0]);
                                })
                            })

                            // Add achievement to user log
                            var now_unix_time = Math.round((new Date()).getTime() / 1000);
                            const csrftoken = getCookie('csrftoken');
                            fetch('/control_interface/api/user_log/', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': csrftoken
                                },
                                body: JSON.stringify({user_id: input.user_id, type: "achievement", unix_time: now_unix_time, description: "daily_schedule"})
                            })

                            // Send notification
                            fetch('/control_interface/api/notifications/')
                            .then(response => response.json())
                            .then(notifications_data => {
                                var number_of_notifications = notifications_data[0].notifications.notifications.length;
                                var current_user = notifications_data[0].user_id;

                                // Update notifications table in database
                                var today = new Date();
                                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                var new_timestamp = today.getDate() + " " + months[today.getMonth()] + " " + today.getUTCFullYear() + ", " + days[today.getDay()];
                                notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 5 points for using schedule-based control for your devices today."});
                                fetch('/control_interface/api/notifications/' + current_user.toString() + '/', {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(notifications_data[0])
                                })

                                // Update number on bell
                                document.getElementById("number_of_notifications").innerHTML = (number_of_notifications + 1);

                                // Update notifications in list
                                document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 5 points for using schedule-based control for your devices today. </span> </div> </a>`)

                                // Animate the bell
                                document.getElementById("bell_icon").style.animationIterationCount = "infinite";
                            })
                        }
                    }
                }
            })
        })
    }

    checkConflicts = (schedulerData, event) => {
        var hasConflict = false;
        var conflictedEvents = [];
        var plugload_option = document.querySelectorAll('input[name="ScheduleApplyOption"]:checked');
        var repeat_option = document.querySelectorAll('input[name="ScheduleRepeatOption"]:checked');
        var new_days_to_loop_over = [];
        var new_start = from12to24(document.getElementById("StartHour").value + ":" + document.getElementById("StartMinute").value + " " + document.getElementById("StartAMPM").value);
        var new_end = from12to24(document.getElementById("EndHour").value + ":" + document.getElementById("EndMinute").value + " " + document.getElementById("EndAMPM").value)
        for (var repeat_day of repeat_option) {
            if (new_start < "08:00:00") {
                if (repeat_day === document.getElementById("ScheduleRepeatMonday")) {
                    new_days_to_loop_over.push(getDates()[7])
                }
                if (repeat_day === document.getElementById("ScheduleRepeatTuesday")) {
                    new_days_to_loop_over.push(getDates()[0])
                }
                if (repeat_day === document.getElementById("ScheduleRepeatWednesday")) {
                    new_days_to_loop_over.push(getDates()[1])
                }
                if (repeat_day === document.getElementById("ScheduleRepeatThursday")) {
                    new_days_to_loop_over.push(getDates()[2])
                }
                if (repeat_day === document.getElementById("ScheduleRepeatFriday")) {
                    new_days_to_loop_over.push(getDates()[3])
                }
                if (repeat_day === document.getElementById("ScheduleRepeatSaturday")) {
                    new_days_to_loop_over.push(getDates()[4])
                }
                if (repeat_day === document.getElementById("ScheduleRepeatSunday")) {
                    new_days_to_loop_over.push(getDates()[5])
                }
            } else {
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
        }

        var new_start_for_this = "";
        var new_end_for_this = "";
        var existing_start_for_this = "";
        var existing_end_for_this = "";
        if (typeof event.id === "string") {
            var n = event.id.indexOf("-")
            var processed_event_id = Number(event.id.substring(0,n))
        } else {
            processed_event_id = event.id
        }
        for (var new_day of new_days_to_loop_over) {
            new_start_for_this = new_day + " " + new_start;
            new_end_for_this = new_day + " " + new_end;
            for (var plugload of plugload_option) {
                var current_resource_id = 0;
                if (plugload === document.getElementById("ScheduleApplyDesktop")) {
                    current_resource_id = 1;
                }
                if (plugload === document.getElementById("ScheduleApplyLaptop")) {
                    current_resource_id = 2;
                }
                if (plugload === document.getElementById("ScheduleApplyMonitor")) {
                    current_resource_id = 3;
                }
                if (plugload === document.getElementById("ScheduleApplyTaskLamp")) {
                    current_resource_id = 4;
                }
                if (plugload === document.getElementById("ScheduleApplyFan")) {
                    current_resource_id = 5;
                }
                this.props.events.forEach(function(e) {
                    if (e.resourceId === current_resource_id) {
                        var existing_days_to_loop_over = [];
                        if (e.start.substring(11,19) < "08:00:00") {
                            if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                existing_days_to_loop_over.push(getDates()[7]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                existing_days_to_loop_over.push(getDates()[0]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                existing_days_to_loop_over.push(getDates()[1]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                existing_days_to_loop_over.push(getDates()[2]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                existing_days_to_loop_over.push(getDates()[3]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                existing_days_to_loop_over.push(getDates()[4]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                existing_days_to_loop_over.push(getDates()[5]);
                            }
                        } else {
                            if (e.rrule.substring(60, e.rrule.length).includes("MO")) {
                                existing_days_to_loop_over.push(getDates()[0]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("TU")) {
                                existing_days_to_loop_over.push(getDates()[1]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("WE")) {
                                existing_days_to_loop_over.push(getDates()[2]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("TH")) {
                                existing_days_to_loop_over.push(getDates()[3]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("FR")) {
                                existing_days_to_loop_over.push(getDates()[4]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("SA")) {
                                existing_days_to_loop_over.push(getDates()[5]);
                            }
                            if (e.rrule.substring(60, e.rrule.length).includes("SU")) {
                                existing_days_to_loop_over.push(getDates()[6]);
                            }
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
                                  e.id !== processed_event_id)) {
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

        return [hasConflict, conflictedEvents]
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

            // Checking for achievements
            window.calendar.updateScheduleAchievements()
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
                var [hasConflict, conflictedEvents] = window.calendar.checkConflicts(schedulerData, event)

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = "";
                        if (events.start.substring(11,19) < "08:00:00") {
                            if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                                day = day + "Monday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                                day = day + "Tuesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                                day = day + "Wednesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                                day = day + "Thursday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                                day = day + "Friday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                                day = day + "Saturday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                                day = day + "Sunday, "
                            }
                        } else {
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
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.startDate.substring(0,4) +
                                      window.calendar.props.startDate.substring(5,7) +
                                      window.calendar.props.startDate.substring(8,10) + "T000000Z;UNTIL=" +
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

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();


                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Checking for achievements
                    window.calendar.updateScheduleAchievements()
                    window.calendar.updateDailyScheduleAchievements()

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 3000)
                }
            }
        }

         ReactDOM.render(
            <ScheduleControlPopup
                type=""
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
            rrule: "FREQ=WEEKLY;DTSTART=" + this.props.startDate.substring(0,4) + this.props.startDate.substring(5,7) + this.props.startDate.substring(8,10) + "T000000Z;UNTIL=" + this.props.sundayDate.substring(0,4) + this.props.sundayDate.substring(5,7) + this.props.sundayDate.substring(8,10) + "T235900Z;BYDAY=" + this.props.day.substring(0,2).toUpperCase()
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

            // Checking for achievements
            window.calendar.updateScheduleAchievements()
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
                var [hasConflict, conflictedEvents] = window.calendar.checkConflicts(schedulerData, newEvent)

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.start.substring(11,19) < "08:00:00") {
                            if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                                day = day + "Monday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                                day = day + "Tuesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                                day = day + "Wednesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                                day = day + "Thursday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                                day = day + "Friday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                                day = day + "Saturday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                                day = day + "Sunday, "
                            }
                        } else {
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
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.startDate.substring(0,4) +
                                      window.calendar.props.startDate.substring(5,7) +
                                      window.calendar.props.startDate.substring(8,10) + "T000000Z;UNTIL=" +
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

                    // Update database (Add)
                    window.calendar.props.onAddClick(formatForDatabaseAdd(newEvent, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Checking for achievements
                    window.calendar.updateScheduleAchievements()
                    window.calendar.updateDailyScheduleAchievements()

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 3000)
                }
            }
        }


        ReactDOM.render(
            <ScheduleControlPopup
                type="new"
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

            // Checking for achievements
            window.calendar.updateScheduleAchievements()

        }
        function deleteButtonClicked() {
            // Update calendar
            schedulerData.removeEvent(event);

            // Update database
            window.calendar.props.onDeleteClick(event.database_id);
            window.calendar.props.refetchData();

            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

            // Checking for achievements
            window.calendar.updateScheduleAchievements()

            window.calendar.setState({
                viewModel: schedulerData
            })
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
                var [hasConflict, conflictedEvents] = window.calendar.checkConflicts(schedulerData, event)

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.start.substring(11,19) < "08:00:00") {
                            if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                                day = day + "Monday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                                day = day + "Tuesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                                day = day + "Wednesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                                day = day + "Thursday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                                day = day + "Friday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                                day = day + "Saturday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                                day = day + "Sunday, "
                            }
                        } else {
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
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.startDate.substring(0,4) +
                                      window.calendar.props.startDate.substring(5,7) +
                                      window.calendar.props.startDate.substring(8,10) + "T000000Z;UNTIL=" +
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


                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Checking for achievements
                    window.calendar.updateScheduleAchievements()
                    window.calendar.updateDailyScheduleAchievements()

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 3000)
                }
            }
        }

        var slotName = schedulerData.getSlotById(event.resourceId).name;
        ReactDOM.render(
            <ScheduleControlPopup
                type=""
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

            // Checking for achievements
            window.calendar.updateScheduleAchievements()
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

            // Checking for achievements
            window.calendar.updateScheduleAchievements()
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
                var [hasConflict, conflictedEvents] = window.calendar.checkConflicts(schedulerData, event)

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.start.substring(11,19) < "08:00:00") {
                            if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                                day = day + "Monday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                                day = day + "Tuesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                                day = day + "Wednesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                                day = day + "Thursday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                                day = day + "Friday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                                day = day + "Saturday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                                day = day + "Sunday, "
                            }
                        } else {
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
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.startDate.substring(0,4) +
                                      window.calendar.props.startDate.substring(5,7) +
                                      window.calendar.props.startDate.substring(8,10) + "T000000Z;UNTIL=" +
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

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Checking for achievements
                    window.calendar.updateScheduleAchievements()
                    window.calendar.updateDailyScheduleAchievements()

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 3000)
                }
            }
        }


        var slotName = schedulerData.getSlotById(event.resourceId).name;
        ReactDOM.render(
            <ScheduleControlPopup
                type=""
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

            // Checking for achievements
            window.calendar.updateScheduleAchievements()
        }

        function deleteButtonClicked() {
            // Update database (Delete)
            window.calendar.props.onDeleteClick(event.database_id);
            window.calendar.props.refetchData();

            ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

            // Checking for achievements
            window.calendar.updateScheduleAchievements()

            // Update calendar
            schedulerData.removeEvent(event);
            window.calendar.setState({
                viewModel: schedulerData
            })
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
                var [hasConflict, conflictedEvents] = window.calendar.checkConflicts(schedulerData, event)

                if (hasConflict) {
                    var message = "Conflict occurred for the following events:"
                    for (var events of conflictedEvents) {
                        var day = ""
                        if (events.start.substring(11,19) < "08:00:00") {
                            if (events.rrule.substring(60,events.rrule.length).includes("SU")) {
                                day = day + "Monday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("MO")) {
                                day = day + "Tuesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TU")) {
                                day = day + "Wednesday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("WE")) {
                                day = day + "Thursday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("TH")) {
                                day = day + "Friday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("FR")) {
                                day = day + "Saturday, "
                            }
                            if (events.rrule.substring(60,events.rrule.length).includes("SA")) {
                                day = day + "Sunday, "
                            }
                        } else {
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
                    var event_rrule = "FREQ=WEEKLY;DTSTART=" + window.calendar.props.startDate.substring(0,4) +
                                      window.calendar.props.startDate.substring(5,7) +
                                      window.calendar.props.startDate.substring(8,10) + "T000000Z;UNTIL=" +
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

                    // Update database (Update)
                    window.calendar.props.onUpdateClick(formatForDatabaseUpdate(event, window.calendar.props.current_user_id));
                    window.calendar.props.refetchData();

                    ReactDOM.unmountComponentAtNode(document.getElementById("popup-container-schedule"));

                    // Checking for achievements
                    window.calendar.updateScheduleAchievements()
                    window.calendar.updateDailyScheduleAchievements()

                    // Update calendar
                    window.calendar.setState({
                        viewModel: schedulerData
                    })

                    window.calendar.props.refetchData();
                    setTimeout(function() {document.getElementById(window.calendar.props.day + "Calendar").click()}, 3000)
                }
            }
        }


        ReactDOM.render(
            <ScheduleControlPopup
                type=""
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