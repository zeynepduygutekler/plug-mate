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

var _popover = require('antd/lib/popover');

var _popover2 = _interopRequireDefault(_popover);

require('antd/lib/popover/style/index.css');

var _EventItemPopover = require('./EventItemPopover');

var _EventItemPopover2 = _interopRequireDefault(_EventItemPopover);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AgendaEventItem = (_temp = _class = function (_Component) {
    _inherits(AgendaEventItem, _Component);

    function AgendaEventItem(props) {
        _classCallCheck(this, AgendaEventItem);

        return _possibleConstructorReturn(this, (AgendaEventItem.__proto__ || Object.getPrototypeOf(AgendaEventItem)).call(this, props));
    }

    _createClass(AgendaEventItem, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                eventItem = _props.eventItem,
                isStart = _props.isStart,
                isEnd = _props.isEnd,
                eventItemClick = _props.eventItemClick,
                schedulerData = _props.schedulerData,
                eventItemTemplateResolver = _props.eventItemTemplateResolver;
            var config = schedulerData.config;

            var roundCls = isStart ? isEnd ? 'round-all' : 'round-head' : isEnd ? 'round-tail' : 'round-none';
            var bgColor = config.defaultEventBgColor;
            if (!!eventItem.bgColor) bgColor = eventItem.bgColor;

            var titleText = schedulerData.behaviors.getEventTextFunc(schedulerData, eventItem);
            var content = _react2.default.createElement(_EventItemPopover2.default, _extends({}, this.props, {
                title: eventItem.title,
                startTime: eventItem.start,
                endTime: eventItem.end,
                statusColor: bgColor
            }));

            var eventItemTemplate = _react2.default.createElement(
                'div',
                { className: roundCls + ' event-item', key: eventItem.id,
                    style: { height: config.eventItemHeight, maxWidth: config.agendaMaxEventWidth, backgroundColor: bgColor } },
                _react2.default.createElement(
                    'span',
                    { style: { marginLeft: '10px', lineHeight: config.eventItemHeight + 'px' } },
                    titleText
                )
            );
            if (eventItemTemplateResolver != undefined) eventItemTemplate = eventItemTemplateResolver(schedulerData, eventItem, bgColor, isStart, isEnd, 'event-item', config.eventItemHeight, config.agendaMaxEventWidth);

            return config.eventItemPopoverEnabled ? _react2.default.createElement(
                _popover2.default,
                { placement: 'bottomLeft', content: content, trigger: 'hover' },
                _react2.default.createElement(
                    'a',
                    { className: 'day-event', onClick: function onClick() {
                            if (!!eventItemClick) eventItemClick(schedulerData, eventItem);
                        } },
                    eventItemTemplate
                )
            ) : _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'a',
                    { className: 'day-event', onClick: function onClick() {
                            if (!!eventItemClick) eventItemClick(schedulerData, eventItem);
                        } },
                    eventItemTemplate
                )
            );
        }
    }]);

    return AgendaEventItem;
}(_react.Component), _class.propTypes = {
    schedulerData: _propTypes.PropTypes.object.isRequired,
    eventItem: _propTypes.PropTypes.object.isRequired,
    isStart: _propTypes.PropTypes.bool.isRequired,
    isEnd: _propTypes.PropTypes.bool.isRequired,
    subtitleGetter: _propTypes.PropTypes.func,
    eventItemClick: _propTypes.PropTypes.func,
    viewEventClick: _propTypes.PropTypes.func,
    viewEventText: _propTypes.PropTypes.string,
    viewEvent2Click: _propTypes.PropTypes.func,
    viewEvent2Text: _propTypes.PropTypes.string,
    eventItemTemplateResolver: _propTypes.PropTypes.func
}, _temp);
exports.default = AgendaEventItem;