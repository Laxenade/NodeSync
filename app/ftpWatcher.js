"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _fileComparator = require("./fileComparator");

var _fileComparator2 = _interopRequireDefault(_fileComparator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Ftp = require("ftp");
var log = require("winston");
var schedule = require("node-schedule");

var _require = require('immutable'),
    List = _require.List;

var FtpWatcher = function () {
    function FtpWatcher() {
        (0, _classCallCheck3.default)(this, FtpWatcher);
    }

    (0, _createClass3.default)(FtpWatcher, [{
        key: "init",
        value: function init(config) {
            var _this = this;

            this.client = new Ftp();
            this.fileComparator = new _fileComparator2.default();

            return new Promise(function (resolve, reject) {
                Object.freeze(_this);

                _this.client.on("ready", function () {
                    return resolve(_this);
                });

                _this.client.on("error", function (error) {
                    return reject(error);
                });

                _this.connect(config);
            });
        }
    }, {
        key: "connect",
        value: function connect(config) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                try {
                    if (config !== undefined) {
                        _this2.client.connect(config);
                    } else {
                        _this2.client.connect();
                    }

                    resolve(_this2);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }, {
        key: "end",
        value: function end() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                try {
                    _this3.client.end();
                    resolve(_this3);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }, {
        key: "ls",
        value: function ls(path) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.client.list(path, false, function (error, list) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(list);
                    }
                });
            });
        }
    }, {
        key: "watch",
        value: function watch(path, interval) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var job = schedule.scheduleJob("*/" + interval + " * * * * *", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                        return _regenerator2.default.wrap(function _callee$(_context) {
                            while (1) {
                                switch (_context.prev = _context.next) {
                                    case 0:
                                        _context.t0 = log;
                                        _context.next = 3;
                                        return _this5.ls(path);

                                    case 3:
                                        _context.t1 = _context.sent;

                                        _context.t0.info.call(_context.t0, _context.t1);

                                    case 5:
                                    case "end":
                                        return _context.stop();
                                }
                            }
                        }, _callee, _this5);
                    })));

                    resolve(job);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }, {
        key: "listen",
        value: function listen(path, interval, onInsertion, onDeletion) {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var job = schedule.scheduleJob("*/" + interval + " * * * * *", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                        return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        _this6.ls(path).then(function (_) {
                                            return _this6.fileComparator.compare(_);
                                        }).then(function (files) {
                                            List(files).filter(function (_) {
                                                return _.state === "INSERTED";
                                            }).forEach(function (_) {
                                                return onInsertion(_);
                                            });
                                            List(files).filter(function (_) {
                                                return _.state === "DELETED";
                                            }).forEach(function (_) {
                                                return onDeletion(_);
                                            });
                                        });

                                    case 1:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, _this6);
                    })));

                    resolve(job);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }, {
        key: "listenBatch",
        value: function listenBatch(path, interval, onInsertion, onDeletion) {
            var _this7 = this;

            return new Promise(function (resolve, reject) {
                try {
                    var job = schedule.scheduleJob("*/" + interval + " * * * * *", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                            while (1) {
                                switch (_context3.prev = _context3.next) {
                                    case 0:
                                        _this7.ls(path).then(function (_) {
                                            return _this7.fileComparator.compare(_);
                                        }).then(function (files) {
                                            onInsertion(List(files).filter(function (_) {
                                                return _.state === "INSERTED";
                                            }).toJS());
                                            onDeletion(List(files).filter(function (_) {
                                                return _.state === "DELETED";
                                            }).toJS());
                                        });

                                    case 1:
                                    case "end":
                                        return _context3.stop();
                                }
                            }
                        }, _callee3, _this7);
                    })));

                    resolve(job);
                } catch (error) {
                    reject(error);
                }
            });
        }
    }]);
    return FtpWatcher;
}();

exports.default = FtpWatcher;