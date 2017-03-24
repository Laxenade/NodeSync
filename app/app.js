"use strict";

var _ftpWatcher = require("./ftpWatcher");

var _ftpWatcher2 = _interopRequireDefault(_ftpWatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require("winston");
var argv = require('optimist').argv;

function run() {
    var ftpWatcher = new _ftpWatcher2.default();
    var config = {
        host: argv.host,
        port: argv.port,
        user: argv.user,
        password: argv.password
    };

    var interval = argv.interval || 10;
    var path = argv.path || ".";
    var sync = argv.mode === "watch" ? ftpWatcher.watch(path, interval) :
    // ftpWatcher.listen(path, interval, _ => log.info(`Inserted: ${_.name}`), _ => log.info(`Deleted: ${_.name}`))
    ftpWatcher.listenBatch(path, interval, function (_) {
        return log.info("Inserted: \n" + JSON.stringify(_, null, 2));
    }, function (_) {
        return log.info("Deleted: \n" + JSON.stringify(_, null, 2));
    });

    Promise.all([ftpWatcher.init(config), sync]).catch(function (error) {
        return log.error(error);
    });
}

run();