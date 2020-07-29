'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _AgendaEventItem = require('./AgendaEventItem');

var _AgendaEventItem2 = _interopRequireDefault(_AgendaEventItem);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AgendaResourceEvents = (_temp = _class = function (_Component) {
    _inherits(AgendaResourceEvents, _Component);

    function AgendaResourceEvents(props) {
        _classCallCheck(this, AgendaResourceEvents);

        return _possibleConstructorReturn(this, (AgendaResourceEvents.__proto__ || Object.getPrototypeOf(AgendaResourceEvents)).call(this, props));
    }

    _createClass(AgendaResourceEvents, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                schedulerData = _props.schedulerData,
                resourceEvents = _props.resourceEvents,
                slotClickedFunc = _props.slotClickedFunc,
                slotItemTemplateResolver = _props.slotItemTemplateResolver;
            var startDate = schedulerData.startDate,
                endDate = schedulerData.endDate,
                config = schedulerData.config,
                localeMoment = schedulerData.localeMoment;

            var agendaResourceTableWidth = schedulerData.getResourceTableWidth();
            var width = agendaResourceTableWidth - 2;

            var events = [];
            resourceEvents.headerItems.forEach(function (item) {
                var start = localeMoment(startDate).format(_index.DATE_FORMAT),
                    end = localeMoment(endDate).add(1, 'days').format(_index.DATE_FORMAT),
                    headerStart = localeMoment(item.start).format(_index.DATE_FORMAT),
                    headerEnd = localeMoment(item.end).format(_index.DATE_FORMAT);

                if (start === headerStart && end === headerEnd) {
                    item.events.forEach(function (evt) {
                        var durationStart = localeMoment(startDate);
                        var durationEnd = localeMoment(endDate).add(1, 'days');
                        var eventStart = localeMoment(evt.eventItem.start);
                        var eventEnd = localeMoment(evt.eventItem.end);
                        var isStart = eventStart >= durationStart;
                        var isEnd = eventEnd < durationEnd;
                        var eventItem = _react2.default.createElement(_AgendaEventItem2.default, _extends({}, _this2.props, {
                            key: evt.eventItem.id,
                            eventItem: evt.eventItem,
                            isStart: isStart,
                            isEnd: isEnd
                        }));
                        events.push(eventItem);
                    });
                }
            });

            var a = slotClickedFunc != undefined ? _react2.default.createElement(
                'a',
                { onClick: function onClick() {
                        slotClickedFunc(schedulerData, resourceEvents);
                    } },
                resourceEvents.slotName
            ) : _react2.default.createElement(
                'span',
                null,
                resourceEvents.slotName
            );
            var slotItem = _react2.default.createElement(
                'div',
                { style: { width: width }, title: resourceEvents.slotName, className: 'overflow-text header2-text' },
                a
            );
            if (!!slotItemTemplateResolver) {
                var temp = slotItemTemplateResolver(schedulerData, resourceEvents, slotClickedFunc, width, "overflow-text header2-text");
                if (!!temp) slotItem = temp;
            }

            return _react2.default.createElement(
                'tr',
                { style: { minHeight: config.eventItemLineHeight + 2 } },
                _react2.default.createElement(
                    'td',
                    { 'data-resource-id': resourceEvents.slotId },
                    slotItem
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'day-event-container' },
                        events
                    )
                )
            );
        }
    }]);

    return AgendaResourceEvents;
}(_react.Component), _class.propTypes = {
    schedulerData: _propTypes.PropTypes.object.isRequired,
    resourceEvents: _propTypes.PropTypes.object.isRequired,
    subtitleGetter: _propTypes.PropTypes.func,
    eventItemClick: _propTypes.PropTypes.func,
    viewEventClick: _propTypes.PropTypes.func,
    viewEventText: _propTypes.PropTypes.string,
    viewEvent2Click: _propTypes.PropTypes.func,
    viewEvent2Text: _propTypes.PropTypes.string,
    slotClickedFunc: _propTypes.PropTypes.func,
    slotItemTemplateResolver: _propTypes.PropTypes.func
}, _temp);
exports.default = AgendaResourceEvents;