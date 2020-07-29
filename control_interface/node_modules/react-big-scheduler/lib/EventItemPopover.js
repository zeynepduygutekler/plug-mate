'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _col2 = require('antd/lib/col');

var _col3 = _interopRequireDefault(_col2);

var _row = require('antd/lib/row');

var _row2 = _interopRequireDefault(_row);

require('antd/lib/grid/style/index.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventItemPopover = (_temp = _class = function (_Component) {
    _inherits(EventItemPopover, _Component);

    function EventItemPopover(props) {
        _classCallCheck(this, EventItemPopover);

        return _possibleConstructorReturn(this, (EventItemPopover.__proto__ || Object.getPrototypeOf(EventItemPopover)).call(this, props));
    }

    _createClass(EventItemPopover, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                schedulerData = _props.schedulerData,
                eventItem = _props.eventItem,
                title = _props.title,
                startTime = _props.startTime,
                endTime = _props.endTime,
                statusColor = _props.statusColor,
                subtitleGetter = _props.subtitleGetter,
                viewEventClick = _props.viewEventClick,
                viewEventText = _props.viewEventText,
                viewEvent2Click = _props.viewEvent2Click,
                viewEvent2Text = _props.viewEvent2Text,
                eventItemPopoverTemplateResolver = _props.eventItemPopoverTemplateResolver;
            var localeMoment = schedulerData.localeMoment,
                config = schedulerData.config;

            var start = localeMoment(startTime),
                end = localeMoment(endTime);

            if (eventItemPopoverTemplateResolver != undefined) {
                return eventItemPopoverTemplateResolver(schedulerData, eventItem, title, start, end, statusColor);
            } else {
                var subtitleRow = _react2.default.createElement('div', null);
                if (subtitleGetter !== undefined) {
                    var subtitle = subtitleGetter(schedulerData, eventItem);
                    if (subtitle != undefined) {
                        subtitleRow = _react2.default.createElement(
                            _row2.default,
                            { type: 'flex', align: 'middle' },
                            _react2.default.createElement(
                                _col3.default,
                                { span: 2 },
                                _react2.default.createElement('div', null)
                            ),
                            _react2.default.createElement(
                                _col3.default,
                                { span: 22, className: 'overflow-text' },
                                _react2.default.createElement(
                                    'span',
                                    { className: 'header2-text', title: subtitle },
                                    subtitle
                                )
                            )
                        );
                    }
                }

                var opsRow = _react2.default.createElement('div', null);
                if (viewEventText !== undefined && viewEventClick !== undefined && (eventItem.clickable1 == undefined || eventItem.clickable1)) {
                    var col = _react2.default.createElement(
                        _col3.default,
                        { span: 22 },
                        _react2.default.createElement(
                            'span',
                            { className: 'header2-text', style: { color: '#108EE9', cursor: 'pointer' }, onClick: function onClick() {
                                    viewEventClick(schedulerData, eventItem);
                                } },
                            viewEventText
                        )
                    );
                    if (viewEvent2Text !== undefined && viewEvent2Click !== undefined && (eventItem.clickable2 == undefined || eventItem.clickable2)) {
                        col = _react2.default.createElement(
                            _col3.default,
                            { span: 22 },
                            _react2.default.createElement(
                                'span',
                                { className: 'header2-text', style: { color: '#108EE9', cursor: 'pointer' }, onClick: function onClick() {
                                        viewEventClick(schedulerData, eventItem);
                                    } },
                                viewEventText
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'header2-text', style: { color: '#108EE9', cursor: 'pointer', marginLeft: '16px' }, onClick: function onClick() {
                                        viewEvent2Click(schedulerData, eventItem);
                                    } },
                                viewEvent2Text
                            )
                        );
                    };
                    opsRow = _react2.default.createElement(
                        _row2.default,
                        { type: 'flex', align: 'middle' },
                        _react2.default.createElement(
                            _col3.default,
                            { span: 2 },
                            _react2.default.createElement('div', null)
                        ),
                        col
                    );
                } else if (viewEvent2Text !== undefined && viewEvent2Click !== undefined && (eventItem.clickable2 == undefined || eventItem.clickable2)) {
                    var _col = _react2.default.createElement(
                        _col3.default,
                        { span: 22 },
                        _react2.default.createElement(
                            'span',
                            { className: 'header2-text', style: { color: '#108EE9', cursor: 'pointer' }, onClick: function onClick() {
                                    viewEvent2Click(schedulerData, eventItem);
                                } },
                            viewEvent2Text
                        )
                    );
                    opsRow = _react2.default.createElement(
                        _row2.default,
                        { type: 'flex', align: 'middle' },
                        _react2.default.createElement(
                            _col3.default,
                            { span: 2 },
                            _react2.default.createElement('div', null)
                        ),
                        _col
                    );
                }

                var dateFormat = config.eventItemPopoverDateFormat;
                return _react2.default.createElement(
                    'div',
                    { style: { width: '300px' } },
                    _react2.default.createElement(
                        _row2.default,
                        { type: 'flex', align: 'middle' },
                        _react2.default.createElement(
                            _col3.default,
                            { span: 2 },
                            _react2.default.createElement('div', { className: 'status-dot', style: { backgroundColor: statusColor } })
                        ),
                        _react2.default.createElement(
                            _col3.default,
                            { span: 22, className: 'overflow-text' },
                            _react2.default.createElement(
                                'span',
                                { className: 'header2-text', title: title },
                                title
                            )
                        )
                    ),
                    subtitleRow,
                    _react2.default.createElement(
                        _row2.default,
                        { type: 'flex', align: 'middle' },
                        _react2.default.createElement(
                            _col3.default,
                            { span: 2 },
                            _react2.default.createElement('div', null)
                        ),
                        _react2.default.createElement(
                            _col3.default,
                            { span: 22 },
                            _react2.default.createElement(
                                'span',
                                { className: 'header1-text' },
                                start.format('HH:mm')
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'help-text', style: { marginLeft: '8px' } },
                                start.format(dateFormat)
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'header2-text', style: { marginLeft: '8px' } },
                                '-'
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'header1-text', style: { marginLeft: '8px' } },
                                end.format('HH:mm')
                            ),
                            _react2.default.createElement(
                                'span',
                                { className: 'help-text', style: { marginLeft: '8px' } },
                                end.format(dateFormat)
                            )
                        )
                    ),
                    opsRow
                );
            }
        }
    }]);

    return EventItemPopover;
}(_react.Component), _class.propTypes = {
    schedulerData: _propTypes.PropTypes.object.isRequired,
    eventItem: _propTypes.PropTypes.object.isRequired,
    title: _propTypes.PropTypes.string.isRequired,
    startTime: _propTypes.PropTypes.string.isRequired,
    endTime: _propTypes.PropTypes.string.isRequired,
    statusColor: _propTypes.PropTypes.string.isRequired,
    subtitleGetter: _propTypes.PropTypes.func,
    viewEventClick: _propTypes.PropTypes.func,
    viewEventText: _propTypes.PropTypes.string,
    viewEvent2Click: _propTypes.PropTypes.func,
    viewEvent2Text: _propTypes.PropTypes.string,
    eventItemPopoverTemplateResolver: _propTypes.PropTypes.func
}, _temp);
exports.default = EventItemPopover;