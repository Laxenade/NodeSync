"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('immutable'),
    Map = _require.Map,
    List = _require.List;

var FileComparator = function () {
    function FileComparator() {
        (0, _classCallCheck3.default)(this, FileComparator);

        this.source = [];
        this.target = [];
    }

    (0, _createClass3.default)(FileComparator, [{
        key: "compare",
        value: function compare(list) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                try {
                    var files = List(list).filter(function (_) {
                        return _.type === "-";
                    });
                    var deleted = FileComparator.checkDeletion(_this.source, files);
                    var inserted = FileComparator.checkInsertion(_this.source, files);
                    _this.source = files;

                    resolve(deleted.merge(inserted).toJS());
                } catch (error) {
                    reject(error);
                }
            });
        }
    }], [{
        key: "checkDeletion",
        value: function checkDeletion(source, target) {
            var difference = [];
            for (var i = 0; i < source.size; i += 1) {
                var match = false;
                for (var j = 0; j < target.size; j += 1) {
                    if (JSON.stringify(source.get(i)) === JSON.stringify(target.get(j))) {
                        match = true;
                        break;
                    }
                }
                if (match === false) {
                    difference.push(Map(source.get(i)).merge({ state: "DELETED" }).toJS());
                }
            }
            return List(difference);
        }
    }, {
        key: "checkInsertion",
        value: function checkInsertion(source, target) {
            var difference = [];
            for (var i = 0; i < target.size; i += 1) {
                var match = false;
                for (var j = 0; j < source.size; j += 1) {
                    if (JSON.stringify(target.get(i)) === JSON.stringify(source.get(j))) {
                        match = true;
                        break;
                    }
                }
                if (match === false) {
                    difference.push(Map(target.get(i)).merge({ state: "INSERTED" }).toJS());
                }
            }
            return List(difference);
        }
    }]);
    return FileComparator;
}();

exports.default = FileComparator;