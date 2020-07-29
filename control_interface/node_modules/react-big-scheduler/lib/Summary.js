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

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Summary = (_temp = _class = function (_Component) {
    _inherits(Summary, _Component);

    function Summary(props) {
        _classCallCheck(this, Summary);

        return _possibleConstructorReturn(this, (Summary.__proto__ || Object.getPrototypeOf(Summary)).call(this, props));
    }

    _createClass(Summary, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                summary = _props.summary,
                left = _props.left,
                width = _props.width,
                top = _props.top,
                schedulerData = _props.schedulerData;
            var config = schedulerData.config;

            var color = config.summaryColor;
            if (summary.color != undefined) color = summary.color;
            var textAlign = 'center';
            if (config.summaryPos === _index.SummaryPos.TopRight || config.summaryPos === _index.SummaryPos.BottomRight) textAlign = 'right';else if (config.summaryPos === _index.SummaryPos.TopLeft || config.summaryPos === _index.SummaryPos.BottomLeft) textAlign = 'left';
            var style = { height: config.eventItemHeight, color: color, textAlign: textAlign, marginLeft: '6px', marginRight: '6px' };
            if (summary.fontSize != undefined) style = _extends({}, style, { fontSize: summary.fontSize });

            return _react2.default.createElement(
                'a',
                { className: 'timeline-event header2-text', style: { left: left, width: width, top: top, cursor: 'default' } },
                _react2.default.createElement(
                    'div',
                    { style: style },
                    summary.text
                )
            );
        }
    }]);

    return Summary;
}(_react.Component), _class.propTypes = {
    schedulerData: _propTypes.PropTypes.object.isRequired,
    summary: _propTypes.PropTypes.object.isRequired,
    left: _propTypes.PropTypes.number.isRequired,
    width: _propTypes.PropTypes.number.isRequired,
    top: _propTypes.PropTypes.number.isRequired
}, _temp);
exports.default = Summary;