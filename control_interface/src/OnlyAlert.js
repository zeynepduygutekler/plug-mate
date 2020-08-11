import React, { Component } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';

class OnlyAlert extends Component {
    state = {
        message: this.props.message,
        onOK: this.props.onOK
    }
    render() {
        return (
            <div class="confirm_alert_overlay">
                <div class="confirm_alert_popup">
                    <div class="confirm_alert_content">
                        <FontAwesomeIcon icon={faExclamationTriangle} class="confirm_alert_icon"/>
                        <br/>
                        <br/>
                        <p style={{color:"black"}}> {this.state.message} </p>
                        <br/>
                        <div class="confirm_alert_buttons">
                            <button class="alert_ok" onClick={this.state.onOK}> OK </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default OnlyAlert;