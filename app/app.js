"use strict";

var _ftpWatcher = require("./ftpWatcher");

var _ftpWatcher2 = _interopRequireDefault(_ftpWatcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = require("winston");
var argv = require("optimist").argv;
var Hapi = require("hapi");
var Inert = require("inert");

function runByCmd() {
    var ftpWatcher = new _ftpWatcher2.default();
    var config = {
        host: argv.host.replace("ftp://", ""),
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

function runByEndpoint() {
    var ftpWatcher = new _ftpWatcher2.default();
    var config = {
        host: argv.host.replace("ftp://", ""),
        port: argv.port,
        user: argv.user,
        password: argv.password
    };

    var interval = argv.interval || 10;
    var path = argv.path || "/";
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

function launchServer() {
    var server = new Hapi.Server();
    server.register(Inert, function () {});
    server.connection({ port: 80, host: "localhost" });

    server.route({
        method: "POST",
        path: "/{mode}",
        handler: function handler(request, reply) {
            var ftpWatcher = new _ftpWatcher2.default();
            var payload = request.payload;
            if (!payload.host) {
                reply(JSON.stringify({ res: "missing host" })).code(404);
                return;
            }
            var config = {
                host: payload.host.replace("ftp://", ""),
                port: payload.port === "" ? undefined : payload.port,
                user: payload.user === "" ? undefined : payload.user,
                password: payload.password === "" ? undefined : payload.password
            };
            var interval = payload.interval || 10;
            var path = payload.path || "/";

            var sync = payload.mode === "watch" ? ftpWatcher.watch(path, interval) : ftpWatcher.listenBatch(path, interval, function (_) {
                return log.info("Inserted: \n" + JSON.stringify(_, null, 2));
            }, function (_) {
                return log.info("Deleted: \n" + JSON.stringify(_, null, 2));
            });

            Promise.all([ftpWatcher.init(config), sync]).catch(function (error) {
                return log.error(error);
            });
            reply(JSON.stringify({ res: "success" }));
        }
    });

    server.route({
        method: "GET",
        path: "/",
        handler: {
            file: "static/index.html"
        }
    });

    server.start(function (error) {
        if (error) {
            throw error;
        }
        log.info("Server running at: " + server.info.uri);
    });
}

launchServer();