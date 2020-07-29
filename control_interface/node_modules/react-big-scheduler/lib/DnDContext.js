'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _reactDnd = require('react-dnd');

var _Util = require('./Util');

var _DnDTypes = require('./DnDTypes');

var _index = require('./index');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DnDContext = function DnDContext(sources, DecoratedComponent) {
    var _this = this;

    _classCallCheck(this, DnDContext);

    this.getDropSpec = function () {
        return {
            drop: function drop(props, monitor, component) {
                var schedulerData = props.schedulerData,
                    resourceEvents = props.resourceEvents;
                var cellUnit = schedulerData.cellUnit,
                    localeMoment = schedulerData.localeMoment;

                var type = monitor.getItemType();
                var pos = (0, _Util.getPos)(component.eventContainer);
                var cellWidth = schedulerData.getContentCellWidth();
                var initialStartTime = null,
                    initialEndTime = null;
                if (type === _DnDTypes.DnDTypes.EVENT) {
                    var initialPoint = monitor.getInitialClientOffset();
                    var initialLeftIndex = Math.floor((initialPoint.x - pos.x) / cellWidth);
                    initialStartTime = resourceEvents.headerItems[initialLeftIndex].start;
                    initialEndTime = resourceEvents.headerItems[initialLeftIndex].end;
                    if (cellUnit !== _index.CellUnits.Hour) initialEndTime = localeMoment(resourceEvents.headerItems[initialLeftIndex].start).hour(23).minute(59).second(59).format(_index.DATETIME_FORMAT);
                }
                var point = monitor.getClientOffset();
                var leftIndex = Math.floor((point.x - pos.x) / cellWidth);
                var startTime = resourceEvents.headerItems[leftIndex].start;
                var endTime = resourceEvents.headerItems[leftIndex].end;
                if (cellUnit !== _index.CellUnits.Hour) endTime = localeMoment(resourceEvents.headerItems[leftIndex].start).hour(23).minute(59).second(59).format(_index.DATETIME_FORMAT);

                return {
                    slotId: resourceEvents.slotId,
                    slotName: resourceEvents.slotName,
                    start: startTime,
                    end: endTime,
                    initialStart: initialStartTime,
                    initialEnd: initialEndTime
                };
            },

            canDrop: function canDrop(props, monitor) {
                var schedulerData = props.schedulerData;

                var item = monitor.getItem();
                if (schedulerData._isResizing()) return false;
                var config = schedulerData.config;

                return config.movable && (item.movable == undefined || item.movable !== false);
            }
        };
    };

    this.getDropCollect = function (connect, monitor) {
        return {
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver()
        };
    };

    this.getDropTarget = function () {
        return (0, _reactDnd.DropTarget)([].concat(_toConsumableArray(_this.sourceMap.keys())), _this.getDropSpec(), _this.getDropCollect)(_this.DecoratedComponent);
    };

    this.getDndSource = function () {
        var dndType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _DnDTypes.DnDTypes.EVENT;

        return _this.sourceMap.get(dndType);
    };

    this.sourceMap = new Map();
    sources.forEach(function (item) {
        _this.sourceMap.set(item.dndType, item);
    });
    this.DecoratedComponent = DecoratedComponent;
};

exports.default = DnDContext;