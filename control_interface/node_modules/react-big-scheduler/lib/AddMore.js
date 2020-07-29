'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AddMore = (_temp = _class = function (_Component) {
    _inherits(AddMore, _Component);

    function AddMore(props) {
        _classCallCheck(this, AddMore);

        return _possibleConstructorReturn(this, (AddMore.__proto__ || Object.getPrototypeOf(AddMore)).call(this, props));
    }

    _createClass(AddMore, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                number = _props.number,
                left = _props.left,
                width = _props.width,
                top = _props.top,
                clickAction = _props.clickAction,
                headerItem = _props.headerItem,
                schedulerData = _props.schedulerData;
            var config = schedulerData.config;

            var content = '+' + number + 'more';

            return _react2.default.createElement(
                'a',
                { className: 'timeline-event', style: { left: left, width: width, top: top }, onClick: function onClick() {
                        clickAction(headerItem);
                    } },
                _react2.default.createElement(
                    'div',
                    { style: { height: config.eventItemHeight, color: '#999', textAlign: 'center' } },
                    content
                )
            );
        }
    }]);

    return AddMore;
}(_react.Component), _class.propTypes = {
    schedulerData: _propTypes.PropTypes.object.isRequired,
    number: _propTypes.PropTypes.number.isRequired,
    left: _propTypes.PropTypes.number.isRequired,
    width: _propTypes.PropTypes.number.isRequired,
    top: _propTypes.PropTypes.number.isRequired,
    clickAction: _propTypes.PropTypes.func.isRequired,
    headerItem: _propTypes.PropTypes.object.isRequired
}, _temp);
exports.default = AddMore;