import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ConfirmAlert from './ConfirmAlert';
import Calendar from './Calendar';

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
    constructor(props) {
        super(props);
        window.remote = this;
    }

    state = {
        books: [],
        key: 1,
        devices: []
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData = () => {
        // Fetch data from database
        fetch('/control_interface/api/remote/')
        .then(response => response.json())
        .then(data => {
            data.sort(compare);
            var owned_devices = [];
            for (var entry of data) {
                owned_devices.push(entry.device_type)
            }
            this.setState({books: data, key: this.state.key+1, devices: owned_devices})
        })

        setTimeout(this.fetchData, 5000)
    }

    updateBook = (newBook) => {
        fetch('/control_interface/api/remote/' + newBook.id.toString() + '/', {
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
                <div id="remote_control_space">
                    <RemoteControlList
                        key={this.state.key}
                        books={this.state.books}
                        onUpdateClick={this.updateBook}
                    />
                </div>
                <p style={{float:"right"}}> Note: It will take around 5 seconds for your devices to be switched ON/OFF. </p>
            </>
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
        device_state: this.props.device_state,
        achievements_books: [],
        daily_achievements_books: [],
        points_wallet_books: []
    }

    componentDidMount() {
        Main();
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
        book.id = this.props.user_id;
        this.updateAchievementsBooks(book);
    }

    handleDailyAchievementsUpdate = (book) => {
        this.updateDailyAchievementsBooks(book);
    }

    handlePointsWalletUpdate = (book) => {
        book.id = this.props.user_id;
        this.updatePointsWalletBooks(book);
    }


    updateRemoteAchievements = () => {
        fetch('/control_interface/api/user_presence/')
        .then(response => response.json())
        .then(presence_data => {
            if (presence_data[0].presence === 1) {
                // User is at desk
                fetch('/control_interface/api/achievements_bonus/')
                .then(response => response.json())
                .then(bonus_data => {
                    this.setState({achievements_books: bonus_data}, function() {
                        if (bonus_data[0].first_remote === 0) {
                            // First remote achievement completed
                            bonus_data[0].first_remote = 60;
                            this.handleAchievementsUpdate(bonus_data[0]);

                            // Add points to wallet
                            fetch('/control_interface/api/points_wallet/')
                            .then(response => response.json())
                            .then(points_data => {
                                this.setState({points_wallet_books: points_data}, function() {
                                    points_data[0].points = points_data[0].points + 60;
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
                                body: JSON.stringify({user_id: bonus_data[0].user_id, type: "achievement", unix_time: now_unix_time, description: "first_remote"})
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
                                notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 60 points for trying out our remote control feature for the first time.", type: "success", seen: 0})
                                fetch('/control_interface/api/notifications/' + current_user.toString() + '/', {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(notifications_data[0])
                                })

                                // Update number on bell
                                document.getElementById("number_of_notifications").innerHTML = (Number(document.getElementById("number_of_notifications").innerHTML) + 1)

                                // Update notifications in list
                                document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have have been awarded 60 points for trying out our remote control feature for the first time. </span> </div> </a>`)
                            })
                        }
                    })
                })
            } else {
                // User is not at desk
                fetch('/control_interface/api/achievements_daily/')
                .then(response => response.json())
                .then(daily_data => {
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    this.setState({daily_achievements_books: daily_data}, function() {
                        for (var input of daily_data) {
                            if (input.week_day === days[(new Date()).getDay()]) {
                                if (input.daily_remote === 0) {
                                    // Daily remote achievement completed
                                    input.daily_remote = 5;
                                    this.handleDailyAchievementsUpdate(input);

                                    // Check bonus achievements
                                    fetch('/control_interface/api/achievements_bonus/')
                                    .then(response => response.json())
                                    .then(bonus_data => {
                                        this.setState({achievements_books: bonus_data}, function() {
                                            if (bonus_data[0].first_remote === 0) {
                                                // First remote achievement completed
                                                bonus_data[0].first_remote = 60;
                                                this.handleAchievementsUpdate(bonus_data[0]);

                                                // Add points to wallet (65)
                                                fetch('/control_interface/api/points_wallet/')
                                                .then(response => response.json())
                                                .then(points_data => {
                                                    this.setState({points_wallet_books: points_data}, function() {
                                                        points_data[0].points = points_data[0].points + 65;
                                                        this.handlePointsWalletUpdate(points_data[0]);
                                                    })
                                                })

                                                // Add achievements to user log
                                                var now_unix_time = Math.round((new Date()).getTime() / 1000);
                                                const csrftoken = getCookie('csrftoken');
                                                // Bonus achievement
                                                fetch('/control_interface/api/user_log/', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRFToken': csrftoken
                                                    },
                                                    body: JSON.stringify({user_id: bonus_data[0].user_id, type: "achievement", unix_time: now_unix_time, description: "first_remote"})
                                                })
                                                // Daily achievement
                                                fetch('/control_interface/api/user_log/', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRFToken': csrftoken
                                                    },
                                                    body: JSON.stringify({user_id: bonus_data[0].user_id, type: "achievement", unix_time: now_unix_time, description: "daily_remote"})
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
                                                    // Bonus achievement
                                                    notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 60 points for trying out our remote control feature for the first time.", type: "success", seen: 0});
                                                    // Daily achievement
                                                    notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 5 points for using remote control while you are away from your desk today.", type: "success", seen: 0});
                                                    fetch('/control_interface/api/notifications/' + current_user.toString() + '/', {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify(notifications_data[0])
                                                    })

                                                    // Update number on bell
                                                    document.getElementById("number_of_notifications").innerHTML = (Number(document.getElementById("number_of_notifications").innerHTML) + 2);

                                                    // Update notifications in list
                                                    // Bonus achievement
                                                    document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 60 points for trying out our remote control feature for the first time. </span> </div> </a>`);
                                                    // Daily achievement
                                                    document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 5 points for using remote control while you are away from your desk today. </span> </div> </a>`);
                                                })
                                            } else {
                                                // First remote achievement previously completed

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
                                                    body: JSON.stringify({user_id: input.user_id, type: "achievement", unix_time: now_unix_time, description: "daily_remote"})
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
                                                    notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 5 points for using remote control while you are away from your desk today.", type: "success", seen: 0});
                                                    fetch('/control_interface/api/notifications/' + current_user.toString() + '/', {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify(notifications_data[0])
                                                    })

                                                    // Update number on bell
                                                    document.getElementById("number_of_notifications").innerHTML = (Number(document.getElementById("number_of_notifications").innerHTML) + 1)

                                                    // Update notifications in list
                                                    document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 5 points for using remote control while you are away from your desk today. </span> </div> </a>`)
                                                })
                                            }
                                        })
                                    })
                                }
                            }
                        }
                    })
                })

            }
        })
    }

    handleFormSubmit = () => {
        this.props.onFormSubmit({...this.state});
    }

    onConfirm1 = () => {
        var to_be_confirmed = this.state.device_type + "ToggleRemote";
        document.getElementById(to_be_confirmed).checked = false;
        this.setState({device_state: false}, function() {this.handleFormSubmit()});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
        Main();

        // Checking for achievements
        this.updateRemoteAchievements();
    }

    onConfirm2 = () => {
        var to_be_confirmed = this.state.device_type + "ToggleRemote";
        document.getElementById(to_be_confirmed).checked = true;
        this.setState({device_state: true}, function() {this.handleFormSubmit()});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
        Main();

        // Checking for achievements
        this.updateRemoteAchievements();
    }

    onCancel1 = () => {
        var to_be_cancelled = this.state.device_type + "ToggleRemote";
        document.getElementById(to_be_cancelled).checked = true;
        this.setState({device_state: true}, function() {this.handleFormSubmit()});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onCancel2 = () => {
        var to_be_cancelled = this.state.device_type + "ToggleRemote";
        document.getElementById(to_be_cancelled).checked = false;
        this.setState({device_state: false}, function() {this.handleFormSubmit()});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onChange = (e) => {
        e.preventDefault();
        if (this.state.device_type === "Desktop" || this.state.device_type === "Laptop") {
            if (this.state.device_state === true) {
                if (document.getElementById("confirm-alert").childNodes.length > 0) {
                    // Switch OFF
                    this.setState({device_state: false}, function() {this.handleFormSubmit()})
                } else {
                    ReactDOM.render(<ConfirmAlert
                                        message={"You are switching off your " + this.state.device_type + "."}
                                        onConfirm = {this.onConfirm1}
                                        onCancel = {this.onCancel1}
                                    />, document.getElementById("confirm-alert"))
                }
            } else {
                if (document.getElementById("confirm-alert").childNodes.length > 0) {
                    // Switch ON
                    this.setState({device_state: true}, function() {this.handleFormSubmit()})
                } else {
                    ReactDOM.render(<ConfirmAlert
                                        message={"You are switching on your " + this.state.device_type + "."}
                                        onConfirm = {this.onConfirm2}
                                        onCancel = {this.onCancel2}
                                    />, document.getElementById("confirm-alert"))
                }
            }
        } else {
            // Update database
            this.setState({device_state: e.target.checked}, function() {this.handleFormSubmit()})
            Main();

            // Checking for achievements
            this.updateRemoteAchievements();
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
            <div id={this.state.device_type.replace(/\s/g,'') + "BoxRemote"} className="containerRemote">
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

    onConfirm1 = () => {
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
        document.getElementById("master").checked = false;
        this.setState({checked: false})
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onConfirm2 = () => {
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
        document.getElementById("master").checked = true;
        this.setState({checked: true});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onCancel1 = () => {
        document.getElementById("master").checked = true;
        this.setState({checked: true});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onCancel2 = () => {
        document.getElementById("master").checked = false;
        this.setState({checked: false});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onChange = (e) => {
        e.preventDefault();
        if (this.state.checked === true) {
            ReactDOM.render(<ConfirmAlert
                                message="You are switching off all your devices."
                                onConfirm = {this.onConfirm1}
                                onCancel = {this.onCancel1}
                             />, document.getElementById("confirm-alert"))
        } else {
            ReactDOM.render(<ConfirmAlert
                                message="You are switching on all your devices."
                                onConfirm = {this.onConfirm2}
                                onCancel = {this.onCancel2}
                            />, document.getElementById("confirm-alert"))
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
    document.getElementById("master").checked = false;
    window.master.setState({checked: false}, function() {
        for (var device of window.remote.state.devices) {
            if (document.getElementById(device.replace(/\s/g,'') + "ToggleRemote").checked) {
                window.master.setState({checked: true});
                document.getElementById("master").checked = true;
            }
        }
    });
}

// Presence Based Control

class PresenceControlDashboard extends Component {
    state = {
        books: [],
        key: 1
    }

    constructor(props) {
        super(props);
        window.presencecontrol = this;
    }

    componentDidMount() {
        // Fetch data from database
        fetch('/control_interface/api/presence/')
        .then(response => response.json())
        .then(data => {
            data.sort(compare);
            this.setState({books: data})
        })
    }

    updateBook = (newBook) => {
        fetch('/control_interface/api/presence/' + newBook.id.toString() + '/', {
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
                      key={this.state.key}
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
        presence_setting: this.props.presence_setting,
        achievements_books: [],
        points_wallet_books: [],
        daily_achievements_books: []
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
        book.id = this.props.user_id;
        this.updateAchievementsBooks(book);
    }

    handleDailyAchievementsUpdate = (book) => {
        this.updateDailyAchievementsBooks(book);
    }

    handlePointsWalletUpdate = (book) => {
        book.id = this.props.user_id;
        this.updatePointsWalletBooks(book);
    }

    updatePresenceAchievements = () => {
        fetch('/control_interface/api/achievements_daily/')
        .then(response => response.json())
        .then(daily_data => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            this.setState({daily_achievements_books: daily_data}, function() {
                for (var input of daily_data) {
                    if (input.week_day === days[(new Date()).getDay()]) {
                        if (input.daily_presence === 0) {
                            // Daily presence achievement completed
                            input.daily_presence = 5;
                            this.handleDailyAchievementsUpdate(input);

                            // Check bonus achievements
                            fetch('/control_interface/api/achievements_bonus/')
                            .then(response => response.json())
                            .then(bonus_data => {
                                this.setState({achievements_books: bonus_data}, function() {
                                    if (bonus_data[0].first_presence === 0) {
                                        // First presence achievement completed
                                        bonus_data[0].first_presence = 70;
                                        this.handleAchievementsUpdate(bonus_data[0]);

                                        // Add points to wallet (75)
                                        fetch('/control_interface/api/points_wallet/')
                                        .then(response => response.json())
                                        .then(points_data => {
                                            this.setState({points_wallet_books: points_data}, function() {
                                                points_data[0].points = points_data[0].points + 75;
                                                this.handlePointsWalletUpdate(points_data[0]);
                                            })
                                        })

                                        // Add achievements to user log
                                        var now_unix_time = Math.round((new Date()).getTime() / 1000);
                                        const csrftoken = getCookie('csrftoken');
                                        // Bonus achievement
                                        fetch('/control_interface/api/user_log/', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRFToken': csrftoken
                                            },
                                            body: JSON.stringify({user_id: bonus_data[0].user_id, type: "achievement", unix_time: now_unix_time, description: "first_presence"})
                                        })
                                        // Daily achievement
                                        fetch('/control_interface/api/user_log/', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'X-CSRFToken': csrftoken
                                            },
                                            body: JSON.stringify({user_id: bonus_data[0].user_id, type: "achievement", unix_time: now_unix_time, description: "daily_presence"})
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
                                            // Bonus achievement
                                            notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 70 points for setting your first presence-based setting.", type: "success", seen: 0});
                                            // Daily achievement
                                            notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 5 points for activating presence-based control for your devices today.", type: "success", seen: 0});
                                            fetch ('/control_interface/api/notifications/' + current_user.toString() + '/', {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(notifications_data[0])
                                            })

                                            // Update number on bell
                                            document.getElementById("number_of_notifications").innerHTML = (Number(document.getElementById("number_of_notifications").innerHTML) + 2);

                                            // Update notifications in list
                                            // Bonus achievement
                                            document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 70 points for setting your first presence-based setting. </span> </div> </a>`);
                                            // Daily achievement
                                            document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 5 points for activating presence-based control for your devices today. </span> </div> </a>`);
                                        })
                                    } else {
                                        // First presence achievement previously completed

                                        // Add points to wallet
                                        fetch('/control_interface/api/points_wallet/')
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
                                            body: JSON.stringify({user_id: input.user_id, type: "achievement", unix_time: now_unix_time, description: "daily_presence"})
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
                                            notifications_data[0].notifications.notifications.push({timestamp: new_timestamp, message: "You have been awarded 5 points for activating presence-based control for your devices today.", type: "success", seen: 0});
                                            fetch('/control_interface/api/notifications/' + current_user.toString() + '/', {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify(notifications_data[0])
                                            })

                                            // Update number on bell
                                            document.getElementById("number_of_notifications").innerHTML = (Number(document.getElementById("number_of_notifications").innerHTML) + 1)

                                            // Update notifications in list
                                            document.getElementsByClassName("dropdown-list")[0].childNodes[1].insertAdjacentHTML('afterend', `<a class="dropdown-item d-flex align-items-center" href="#"> <div class="mr-3"> <div class="icon-circle bg-success"> <i class="fas fa-trophy text-white"> </i> </div> </div> <div> <div class="small text-gray-500"> ${new_timestamp} </div> <span class="font-weight-bold"> You have been awarded 5 points for activating presence-based control for your devices today. </span> </div> </a>`);
                                        })
                                    }
                                })
                            })
                        }
                    }
                }
            })
        })
    }

    onConfirm1 = () => {
        // Update database
        this.setState({presence_setting: "1000000"}, function() {this.handleFormSubmit()});
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onCancel1 = () => {
        document.getElementById(this.state.device_type.replace(/\s/g, '') + "Select").value = this.state.presence_setting;
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    handleFormSubmit = () => {
        this.props.onFormSubmit({...this.state});
    }

    handleSettingUpdate = (evt) => {
        if (evt.target.value !== "other" && evt.target.value !== "1000000") {
            // Hide popup
            ReactDOM.unmountComponentAtNode(document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresenceBox"))
            // Update database
            this.setState({presence_setting: evt.target.value}, function() {this.handleFormSubmit()})

            // Checking for achievements
            this.updatePresenceAchievements();
        }
        if (evt.target.value === "other") {
            // Show popup
            ReactDOM.render(
                <PresenceControlPopup
                    device_type={this.state.device_type}
                    handleOtherUpdate={this.handleOtherUpdate}
                    handleEnterClick={this.handleEnterClick}
                    cancelButtonClicked={this.cancelButtonClicked}
                    okButtonClicked={this.okButtonClicked}
                />, document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresenceBox")
            )
        }
        if (evt.target.value === "1000000") {
            // Hide popup
            ReactDOM.unmountComponentAtNode(document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresenceBox"))
            ReactDOM.render(<ConfirmAlert
                                message={"You are deactivating presence-based control for " + this.state.device_type + "."}
                                onConfirm = {this.onConfirm1}
                                onCancel = {this.onCancel1}
                            />, document.getElementById("confirm-alert"))
        }
    }

    handleOtherUpdate = (evt) => {
        this.setState({presence_setting: evt.target.value});
    }

    handleEnterClick = (evt) => {
        if (evt.key === "Enter" || evt.keyCode === 13) {
            this.okButtonClicked();
        }
    }

    onConfirm2 = () => {
        // Change outer ring to red
        document.getElementById(this.state.device_type.replace(/\s/g,'')).className = "redRing";
        // Change image to OFF
        document.getElementById(this.state.device_type.replace(/\s/g,'')).childNodes[0].childNodes[0].src = "/static/Images/" + this.state.device_type.toString() + " OFF.png";
        // Set value to OFF
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "1000000";
        // Update database
        this.setState({presence_setting: "1000000"}, function() {this.handleFormSubmit()})
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    onCancel2 = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById("confirm-alert"));
    }

    handlePresenceIconClick = () => {
        if (document.getElementById(this.state.device_type.replace(/\s/g,'')).className === "greenRing") {
            ReactDOM.render(<ConfirmAlert
                                message={"You are deactivating presence-based control for " + this.state.device_type + "."}
                                onConfirm = {this.onConfirm2}
                                onCancel = {this.onCancel2}
                            />, document.getElementById("confirm-alert"))
        } else {
            // Change outer ring to green
            document.getElementById(this.state.device_type.replace(/\s/g,'')).className = "greenRing"
            // Change image to ON
            document.getElementById(this.state.device_type.replace(/\s/g,'')).childNodes[0].childNodes[0].src = "/static/Images/" + this.state.device_type.toString() + " ON.png";
            // Set value to 5 minutes
            document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "5";
            // Update database
            this.setState({presence_setting: "5"}, function() {this.handleFormSubmit()})

            // Checking for achievements
            this.updatePresenceAchievements();
        }
    }

    cancelButtonClicked = () => {
        // Hide popup
        ReactDOM.unmountComponentAtNode(document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresenceBox"))
        // Set value to 5 minutes
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = "5";
        this.setState({presence_setting: 5}, function() {this.handleFormSubmit()})

        this.updatePresenceAchievements();
    }

    okButtonClicked = () => {
        // Display value on dropdown
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "Select").value = document.getElementById(this.state.device_type.replace(/\s/g,'') + "TextOther").value.toString();
        // Clear text box on popup
        document.getElementById(this.state.device_type.replace(/\s/g,'') + "TextOther").value = "15";
        // Hide popup
        ReactDOM.unmountComponentAtNode(document.getElementById(this.state.device_type.replace(/\s/g,'') + "PopupPresenceBox"))
        // Update database
        this.handleFormSubmit();

        // Checking for achievements
        this.updatePresenceAchievements();
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

        return (
            <div id={this.state.device_type.replace(/\s/g,'') + "BoxPresence"} className="containerPresence" onClick={this.exitClick}>
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
                                <optgroup label="Off after I leave for:">
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

                        <div id={this.state.device_type.replace(/\s/g,'') + "PopupPresenceBox"}> </div>

                    </div>
                </div>
            </div>
        );
    }
}

class PresenceControlPopup extends Component {
    exitClick = () => {
        this.props.cancelButtonClicked();
    }
    render() {
        return (
        <>
            <div id="PopupPresenceOverlay" className="popup_presence_overlay" onClick={this.exitClick}></div>
            <div id={this.props.device_type.replace(/\s/g,'') + "PopupPresence"} className="visiblePresence">
                <input type="number" id={this.props.device_type.replace(/\s/g,'') + "TextOther"} onChange={this.props.handleOtherUpdate} onKeyUp={this.props.handleEnterClick} placeholder="15" />
                <br />
                <p className="minutes"> minutes </p>
                <br />
                <button id={this.props.device_type.replace(/\s/g,'') + "CancelButton"} onClick={this.props.cancelButtonClicked} className="btn btn-sm"> Cancel </button>
                <button id={this.props.device_type.replace(/\s/g,'') + "OkButton"} className="btn btn-sm" onClick={this.props.okButtonClicked}> OK </button>
            </div>
        </>
        )
    }
}

ReactDOM.render(<PresenceControlDashboard />, document.getElementById('presence-based-control'))


// Schedule Based control

function sort_events(a,b) {
    let comparison = 0;
    if (a.start > b.start) {
        comparison = 1;
    } else if (a.start < b.start) {
        comparison = -1
    }
    return comparison
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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0,name.length+1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue
}

class ScheduleControlDashboard extends Component {
    state = {
        events: [],
        dates: [],
        chosen_day: "",
        books: [],
        key: 1,
        devices: []
    }

    componentDidMount() {
        // Fetch data from database
        fetch('/control_interface/api/schedule/')
        .then(response => response.json())
        .then(data => {
            var owned_devices = [];
            if (window.remote.state.devices.includes("Desktop")) {
                owned_devices.push({id: 1, name: "Desktop"})
            }
            if (window.remote.state.devices.includes("Fan")) {
                owned_devices.push({id: 5, name: "Fan"})
            }
            if (window.remote.state.devices.includes("Laptop")) {
                owned_devices.push({id: 2, name: "Laptop"})
            }
            if (window.remote.state.devices.includes("Monitor")) {
                owned_devices.push({id: 3, name: "Monitor"})
            }
            if (window.remote.state.devices.includes("Task Lamp")) {
                owned_devices.push({id: 4, name: "Task Lamp"})
            }
            this.setState({books: data, devices: owned_devices})
            var events_datas = [];
            for (var input of data) {
                this.setState({current_user_id: input.user_id})
                var resourceId = input.device_type_id;
                var eventId = input.event_id;
                var event_start = input.event_start;
                var event_end = input.event_end;

                // Format the title to be shown for each event on the scheduler
                var finalStart = from24to12(event_start);
                var finalEnd = from24to12(event_end)
                var event_name = input.event_name + " (" + finalStart + " - " + finalEnd + ")"

                var [mondayDate, tuesdayDate, wednesdayDate, thursdayDate, fridayDate, saturdayDate, sundayDate, startDate] = getDates();
                var event_rrule = "FREQ=WEEKLY;DTSTART=" + startDate.substring(0,4) + startDate.substring(5,7) + startDate.substring(8,10) + "T000000Z;UNTIL=" + sundayDate.substring(0,4) + sundayDate.substring(5,7) + sundayDate.substring(8,10) + "T235900Z;BYDAY=";
                event_start = "2020-01-01 " + event_start

                if (event_end === "00:00:00") {
                    event_end = "2020-01-02 " + event_end
                } else {
                    event_end = "2020-01-01 " + event_end
                }

                if (input.event_rrule.includes("MondayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "SU";
                    } else {
                        event_rrule = event_rrule + ",SU";
                    }
                } else {
                    if (input.event_rrule.includes("Monday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "MO";
                        } else {
                            event_rrule = event_rrule + ",MO";
                        }
                    }
                }
                if (input.event_rrule.includes("TuesdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "MO";
                    } else {
                        event_rrule = event_rrule + ",MO";
                    }
                } else {
                    if (input.event_rrule.includes("Tuesday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "TU";
                        } else {
                            event_rrule = event_rrule + ",TU";
                        }
                    }
                }
                if (input.event_rrule.includes("WednesdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "TU";
                    } else {
                        event_rrule = event_rrule + ",TU";
                    }
                } else {
                    if (input.event_rrule.includes("Wednesday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "WE";
                        } else {
                            event_rrule = event_rrule + ",WE";
                        }
                    }
                }
                if (input.event_rrule.includes("ThursdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "WE";
                    } else {
                        event_rrule = event_rrule + ",WE";
                    }
                } else {
                    if (input.event_rrule.includes("Thursday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "TH";
                        } else {
                            event_rrule = event_rrule + ",TH";
                        }
                    }
                }
                if (input.event_rrule.includes("FridayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "TH";
                    } else {
                        event_rrule = event_rrule + ",TH";
                    }
                } else {
                    if (input.event_rrule.includes("Friday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "FR";
                        } else {
                            event_rrule = event_rrule + ",FR";
                        }
                    }
                }
                if (input.event_rrule.includes("SaturdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "FR";
                    } else {
                        event_rrule = event_rrule + ",FR";
                    }
                } else {
                    if (input.event_rrule.includes("Saturday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "SA";
                        } else {
                            event_rrule = event_rrule + ",SA";
                        }
                    }
                }
                if (input.event_rrule.includes("SundayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "SA";
                    } else {
                        event_rrule = event_rrule + ",SA";
                    }
                } else {
                    if (input.event_rrule.includes("Sunday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "SU";
                        } else {
                            event_rrule = event_rrule + ",SU";
                        }
                    }
                }

                // Set the events for the scheduler
                events_datas.push({id: eventId, start: event_start, end: event_end, title: event_name, rrule: event_rrule, resourceId: resourceId, showPopover: false, bgColor: '#06D6A0', database_id: input.id})

                // Open the calendar for today
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var today = new Date();
                var wanted_id = days[today.getDay()] + "Calendar";
                document.getElementById(wanted_id).className="selected";
                setTimeout(function() {document.getElementById(wanted_id).click()}, 0.1)
            }
            events_datas.sort(sort_events)
            if (events_datas.length === 0) {
                events_datas.push({id: 1, start: getDates()[7] + " 09:00:00", end: getDates()[7] + " 10:00:00", title: "Empty", resourceId: 1, showPopover: false, bgColor: "#06D6A0"})
            }
            this.setState({
                events: events_datas,
                dates: [mondayDate, tuesdayDate, wednesdayDate, thursdayDate, fridayDate, saturdayDate, sundayDate, startDate]
            })
        })
    }

    refetchData = () => {
        // Fetch data from database
        fetch('/control_interface/api/schedule/')
        .then(response => response.json())
        .then(data => {
            var owned_devices = [];
            if (window.remote.state.devices.includes("Desktop")) {
                owned_devices.push({id: 1, name: "Desktop"})
            }
            if (window.remote.state.devices.includes("Fan")) {
                owned_devices.push({id: 5, name: "Fan"})
            }
            if (window.remote.state.devices.includes("Laptop")) {
                owned_devices.push({id: 2, name: "Laptop"})
            }
            if (window.remote.state.devices.includes("Monitor")) {
                owned_devices.push({id: 3, name: "Monitor"})
            }
            if (window.remote.state.devices.includes("Task Lamp")) {
                owned_devices.push({id: 4, name: "Task Lamp"})
            }
            this.setState({books: data, devices: owned_devices})
            var events_datas = [];
            for (var input of data) {
                this.setState({current_user_id: input.user_id})
                var resourceId = input.device_type_id;
                var eventId = input.event_id;
                var event_start = input.event_start;
                var event_end = input.event_end;

                // Format the title to be shown for each event on the scheduler
                var finalStart = from24to12(event_start);
                var finalEnd = from24to12(event_end)
                var event_name = input.event_name + " (" + finalStart + " - " + finalEnd + ")"

                var [mondayDate, tuesdayDate, wednesdayDate, thursdayDate, fridayDate, saturdayDate, sundayDate, startDate] = getDates();
                var event_rrule = "FREQ=WEEKLY;DTSTART=" + startDate.substring(0,4) + startDate.substring(5,7) + startDate.substring(8,10) + "T000000Z;UNTIL=" + sundayDate.substring(0,4) + sundayDate.substring(5,7) + sundayDate.substring(8,10) + "T235900Z;BYDAY=";
                event_start = "2020-01-01 " + event_start

                if (event_end === "00:00:00") {
                    event_end = "2020-01-02 " + event_end
                } else {
                    event_end = "2020-01-01 " + event_end
                }

                if (input.event_rrule.includes("MondayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "SU";
                    } else {
                        event_rrule = event_rrule + ",SU";
                    }
                } else {
                    if (input.event_rrule.includes("Monday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "MO";
                        } else {
                            event_rrule = event_rrule + ",MO";
                        }
                    }
                }
                if (input.event_rrule.includes("TuesdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "MO";
                    } else {
                        event_rrule = event_rrule + ",MO";
                    }
                } else {
                    if (input.event_rrule.includes("Tuesday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "TU";
                        } else {
                            event_rrule = event_rrule + ",TU";
                        }
                    }
                }
                if (input.event_rrule.includes("WednesdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "TU";
                    } else {
                        event_rrule = event_rrule + ",TU";
                    }
                } else {
                    if (input.event_rrule.includes("Wednesday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "WE";
                        } else {
                            event_rrule = event_rrule + ",WE";
                        }
                    }
                }
                if (input.event_rrule.includes("ThursdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "WE";
                    } else {
                        event_rrule = event_rrule + ",WE";
                    }
                } else {
                    if (input.event_rrule.includes("Thursday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "TH";
                        } else {
                            event_rrule = event_rrule + ",TH";
                        }
                    }
                }
                if (input.event_rrule.includes("FridayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "TH";
                    } else {
                        event_rrule = event_rrule + ",TH";
                    }
                } else {
                    if (input.event_rrule.includes("Friday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "FR";
                        } else {
                            event_rrule = event_rrule + ",FR";
                        }
                    }
                }
                if (input.event_rrule.includes("SaturdayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "FR";
                    } else {
                        event_rrule = event_rrule + ",FR";
                    }
                } else {
                    if (input.event_rrule.includes("Saturday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "SA";
                        } else {
                            event_rrule = event_rrule + ",SA";
                        }
                    }
                }
                if (input.event_rrule.includes("SundayMorning")) {
                    if (event_rrule.charAt(event_rrule.length-1) === "=") {
                        event_rrule = event_rrule + "SA";
                    } else {
                        event_rrule = event_rrule + ",SA";
                    }
                } else {
                    if (input.event_rrule.includes("Sunday")) {
                        if (event_rrule.charAt(event_rrule.length-1) === "=") {
                            event_rrule = event_rrule + "SU";
                        } else {
                            event_rrule = event_rrule + ",SU";
                        }
                    }
                }

                // Set the events for the scheduler
                events_datas.push({id: eventId, start: event_start, end: event_end, title: event_name, rrule: event_rrule, resourceId: resourceId, showPopover: false, bgColor: '#06D6A0', database_id: input.id})
            }
            events_datas.sort(sort_events)
            if (events_datas.length === 0) {
                events_datas.push({id: 1, start: getDates()[7] + " 09:00:00", end: getDates()[7] + " 10:00:00", title: "Empty", resourceId: 1, showPopover: false, bgColor: "#06D6A0"})
            }
            this.setState({
                events: events_datas,
                dates: [mondayDate, tuesdayDate, wednesdayDate, thursdayDate, fridayDate, saturdayDate, sundayDate, startDate]
            })
        })
    }

    createNewBook = (book) => {
        const csrftoken = getCookie('csrftoken');
        fetch('/control_interface/api/schedule/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(book),
        })
        .then(response => response.json())
        .then(book => {
            this.setState({books: this.state.books.concat([book])});
        })
    }

    updateBook = (newBook) => {
        fetch('/control_interface/api/schedule/' + newBook.id.toString() + '/', {
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

    deleteBook = (bookId) => {
        fetch('/control_interface/api/schedule/' + bookId + '/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(() => {
            this.setState({books: this.state.books.filter(book => book.id !== bookId)})
        })
    }

    chooseMonday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Monday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "selected";
        document.getElementById("TuesdayCalendar").className = "";
        document.getElementById("WednesdayCalendar").className = "";
        document.getElementById("ThursdayCalendar").className = "";
        document.getElementById("FridayCalendar").className = "";
        document.getElementById("SaturdayCalendar").className = "";
        document.getElementById("SundayCalendar").className = "";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[0]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Monday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    chooseTuesday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Tuesday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "";
        document.getElementById("TuesdayCalendar").className = "selected";
        document.getElementById("WednesdayCalendar").className = "";
        document.getElementById("ThursdayCalendar").className = "";
        document.getElementById("FridayCalendar").className = "";
        document.getElementById("SaturdayCalendar").className = "";
        document.getElementById("SundayCalendar").className = "";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[1]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Tuesday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    chooseWednesday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Wednesday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "";
        document.getElementById("TuesdayCalendar").className = "";
        document.getElementById("WednesdayCalendar").className = "selected";
        document.getElementById("ThursdayCalendar").className = "";
        document.getElementById("FridayCalendar").className = "";
        document.getElementById("SaturdayCalendar").className = "";
        document.getElementById("SundayCalendar").className = "";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[2]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Wednesday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    chooseThursday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Thursday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "";
        document.getElementById("TuesdayCalendar").className = "";
        document.getElementById("WednesdayCalendar").className = "";
        document.getElementById("ThursdayCalendar").className = "selected";
        document.getElementById("FridayCalendar").className = "";
        document.getElementById("SaturdayCalendar").className = "";
        document.getElementById("SundayCalendar").className = "";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[3]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Thursday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    chooseFriday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Friday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "";
        document.getElementById("TuesdayCalendar").className = "";
        document.getElementById("WednesdayCalendar").className = "";
        document.getElementById("ThursdayCalendar").className = "";
        document.getElementById("FridayCalendar").className = "selected";
        document.getElementById("SaturdayCalendar").className = "";
        document.getElementById("SundayCalendar").className = "";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[4]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Friday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    chooseSaturday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Saturday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "";
        document.getElementById("TuesdayCalendar").className = "";
        document.getElementById("WednesdayCalendar").className = "";
        document.getElementById("ThursdayCalendar").className = "";
        document.getElementById("FridayCalendar").className = "";
        document.getElementById("SaturdayCalendar").className = "selected";
        document.getElementById("SundayCalendar").className = "";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[5]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Saturday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    chooseSunday = () => {
        this.refetchData();
        // Update chosen_day state
        this.setState({chosen_day: "Sunday"})

        // Adjust colour of tabs
        document.getElementById("MondayCalendar").className = "";
        document.getElementById("TuesdayCalendar").className = "";
        document.getElementById("WednesdayCalendar").className = "";
        document.getElementById("ThursdayCalendar").className = "";
        document.getElementById("FridayCalendar").className = "";
        document.getElementById("SaturdayCalendar").className = "";
        document.getElementById("SundayCalendar").className = "selected";

        // Adjust calendar shown
        ReactDOM.unmountComponentAtNode(document.getElementById("root"));
        ReactDOM.render(
            <Calendar
                refetchData={this.refetchData}
                events={this.state.events}
                devices={this.state.devices}
                date={this.state.dates[6]}
                onDeleteClick={this.deleteBook}
                onAddClick={this.createNewBook}
                onUpdateClick={this.updateBook}
                books={this.state.books}
                startDate={this.state.dates[7]}
                mondayDate={this.state.dates[0]}
                sundayDate={this.state.dates[6]}
                day="Sunday"
                current_user_id={this.state.current_user_id}
            />, document.getElementById("root"));
    }

    render() {
        return (
            <>
                <div className="tab">
                    <button id="MondayCalendar" onClick={this.chooseMonday}> Monday </button>
                    <button id="TuesdayCalendar" onClick={this.chooseTuesday}> Tuesday </button>
                    <button id="WednesdayCalendar" onClick={this.chooseWednesday}> Wednesday </button>
                    <button id="ThursdayCalendar" onClick={this.chooseThursday}> Thursday </button>
                    <button id="FridayCalendar" onClick={this.chooseFriday}> Friday </button>
                    <button id="SaturdayCalendar" onClick={this.chooseSaturday}> Saturday </button>
                    <button id="SundayCalendar" onClick={this.chooseSunday}> Sunday </button>
                </div>
                <ScheduleControlItem
                    key={this.state.key}
                    refetchData={this.refetchData}
                    events={this.state.events}
                    devices={this.state.devices}
                    dates={this.state.dates}
                    onDeleteClick={this.deleteBook}
                    onAddClick={this.createNewBook}
                    onUpdateClick={this.updateBook}
                    books={this.state.books}
                    current_user_id={this.state.current_user_id}
                />
                <div id="popup-container-schedule"> </div>
            </>
        )
    }
}

class ScheduleControlItem extends Component {
    render() {
        const days=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        var today = new Date()
        var today_date = today.getFullYear() + "-" + ((today.getMonth() + 1).toString().length === 1 ? "0" + (today.getMonth() + 1).toString() : (today.getMonth() + 1)) + "-" + (today.getDate().toString().length === 1 ? "0" + today.getDate().toString() : today.getDate())
        return (
            <div id="root">
                <Calendar
                    refetchData={this.props.refetchData}
                    events={this.props.events}
                    devices={this.props.devices}
                    date={today_date}
                    onDeleteClick={this.props.onDeleteClick}
                    onAddClick={this.props.onAddClick}
                    onUpdateClick={this.props.onUpdateClick}
                    books={this.props.books}
                    startDate={this.props.dates[7]}
                    mondayDate={this.props.dates[0]}
                    sundayDate={this.props.dates[6]}
                    day={days[today.getDay()]}
                    current_user_id={this.props.current_user_id}
                />
            </div>
        )
    }
}

ReactDOM.render(<ScheduleControlDashboard />, document.getElementById('schedule-based-control'))


// Others

// Information icons
var remotecontrolelement = document.getElementById("remotecontrolrect");
var infoiconremote = document.getElementById("infoIconRemote");
var scheduleelement = document.getElementById("schedulebasedrect");
var infoiconschedule = document.getElementById("infoIcon");
var presenceelement = document.getElementById("presencebasedrect");
var infoiconpresence = document.getElementById("infoIconPresence");

window.onload = function() {
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

window.addEventListener('resize', update_infobox_on_resize)

function update_infobox_on_resize() {
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

// Fix for Google Chrome
var isChromium = window.chrome;
var winNav = window.navigator;
var vendorName = winNav.vendor;
var isOpera = typeof window.opr !== "undefined";
var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
var isIOSChrome = winNav.userAgent.match("CriOS");

if (isIOSChrome) {
   // is Google Chrome on IOS
   document.onkeydown = function(event) {
if (event.ctrlKey===true || (event.which === '61' || event.which === '107' || event.which === '173' || event.which === '109'  || event.which === '187'  || event.which === '189'  ) ) {
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
if (event.ctrlKey === true || (event.which === '61' || event.which === '107' || event.which === '173' || event.which === '109'  || event.which === '187'  || event.which === '189'  ) ) {
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

