import FtpWatcher from "./ftpWatcher"

const log = require("winston")
const argv = require('optimist').argv

function run() {
    const ftpWatcher = new FtpWatcher()
    const config = {
        host: argv.host,
        port: argv.port,
        user: argv.user,
        password: argv.password,
    }

    const interval = argv.interval || 10
    const path = argv.path || "."
    const sync = argv.mode === "watch" ?
        ftpWatcher.watch(path, interval) :
        ftpWatcher.listen(path, interval, _ => log.info(`Inserted: ${_.name}`), _ => log.info(`Deleted: ${_.name}`))

    Promise.all([
        ftpWatcher.init(config),
        sync,
    ]).catch(error => log.error(error))
}

run()