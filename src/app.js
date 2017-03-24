import FtpWatcher from "./ftpWatcher"

const log = require("winston")
const argv = require("optimist").argv
const Hapi = require("hapi")

function runByCmd() {
    const ftpWatcher = new FtpWatcher()
    const config = {
        host: argv.host.replace("ftp://", "").slice(0, -1),
        port: argv.port,
        user: argv.user,
        password: argv.password,
    }

    const interval = argv.interval || 10
    const path = argv.path || "."
    const sync = argv.mode === "watch" ?
        ftpWatcher.watch(path, interval) :
        // ftpWatcher.listen(path, interval, _ => log.info(`Inserted: ${_.name}`), _ => log.info(`Deleted: ${_.name}`))
        ftpWatcher.listenBatch(path, interval, _ => log.info(`Inserted: \n${JSON.stringify(_, null, 2)}`), _ => log.info(`Deleted: \n${JSON.stringify(_, null, 2)}`))

    Promise.all([
        ftpWatcher.init(config),
        sync,
    ]).catch(error => log.error(error))
}

function runByEndpoint() {
    const ftpWatcher = new FtpWatcher()
    const config = {
        host: argv.host.replace("ftp://", "").slice(0, -1),
        port: argv.port,
        user: argv.user,
        password: argv.password,
    }

    const interval = argv.interval || 10
    const path = argv.path || "/"
    const sync = argv.mode === "watch" ?
        ftpWatcher.watch(path, interval) :
        // ftpWatcher.listen(path, interval, _ => log.info(`Inserted: ${_.name}`), _ => log.info(`Deleted: ${_.name}`))
        ftpWatcher.listenBatch(path, interval, _ => log.info(`Inserted: \n${JSON.stringify(_, null, 2)}`), _ => log.info(`Deleted: \n${JSON.stringify(_, null, 2)}`))

    Promise.all([
        ftpWatcher.init(config),
        sync,
    ]).catch(error => log.error(error))
}

function launchServer() {
    const server = new Hapi.Server()
    server.connection({ port: 80, host: "localhost" })

    server.route({
        method: "POST",
        path: "/{mode}",
        handler: (request, reply) => {
            const ftpWatcher = new FtpWatcher()
            const payload = request.payload
            if (!payload.host) {
                reply(JSON.stringify({ res: "missing host" })).code(404)
                return
            }
            const config = {
                host: payload.host.replace("ftp://", "").slice(0, -1),
                port: payload.port,
                user: payload.user,
                password: payload.password,
            }
            const interval = payload.interval || 10
            const path = payload.path || "/"

            const sync = payload.mode === "watch" ?
                ftpWatcher.watch(path, interval) :
                ftpWatcher.listenBatch(path, interval, _ => log.info(`Inserted: \n${JSON.stringify(_, null, 2)}`), _ => log.info(`Deleted: \n${JSON.stringify(_, null, 2)}`))

            Promise.all([
                ftpWatcher.init(config),
                sync,
            ]).catch(error => log.error(error))
            reply(JSON.stringify({ res: "success" }))
        },
    })

    server.start((error) => {
        if (error) {
            throw error
        }
        log.info(`Server running at: ${server.info.uri}`)
    })
}

launchServer()