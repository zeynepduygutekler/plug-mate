import React, { Component } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';

class ConfirmAlert extends Component {
    state = {
        message: this.props.message,
        onConfirm: this.props.onConfirm,
        onCancel: this.props.onCancel
    }
    render() {
        return (
            <div class="confirm_alert_overlay">
                <div class="confirm_alert_popup">
                    <div class="confirm_alert_content">
                        <FontAwesomeIcon icon={faExclamationTriangle} class="confirm_alert_icon"/>
                        <br/>
                        <p> {this.state.message} </p>
                        <br/>
                        <div class="confirm_alert_buttons">
                            <button class="confirm_alert_cancel" onClick={this.state.onCancel}> Cancel </button>
                            <button class="confirm_alert_confirm" onClick={this.state.onConfirm}> Confirm </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ConfirmAlert;