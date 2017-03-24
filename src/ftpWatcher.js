import FileComparator from "./fileComparator"

const Ftp = require("ftp")
const log = require("winston")
const schedule = require("node-schedule")
const { List } = require('immutable')

export default class FtpWatcher {
    init(config) {
        this.client = new Ftp()
        this.fileComparator = new FileComparator()

        return new Promise((resolve, reject) => {
            Object.freeze(this)

            this.client.on("ready", () => resolve(this))

            this.client.on("error", error => reject(error))

            this.connect(config)
        })
    }

    connect(config) {
        return new Promise((resolve, reject) => {
            try {
                if (config !== undefined) {
                    this.client.connect(config)
                } else {
                    this.client.connect()
                }

                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    end() {
        return new Promise((resolve, reject) => {
            try {
                this.client.end()
                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    ls(path) {
        return new Promise((resolve, reject) => {
            this.client.list(path, false, (error, list) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(list)
                }
            })
        })
    }

    watch(path, interval) {
        return new Promise((resolve, reject) => {
            try {
                const job = schedule.scheduleJob(`*/${interval} * * * * *`, async() => {
                    log.info(await this.ls(path))
                })

                resolve(job)
            } catch (error) {
                reject(error)
            }
        })
    }

    listen(path, interval, onInsertion, onDeletion) {
        return new Promise((resolve, reject) => {
            try {
                const job = schedule.scheduleJob(`*/${interval} * * * * *`, async() => {
                    this.ls(path).then(_ => this.fileComparator.compare(_)).then((files) => {
                        List(files).filter(_ => _.state === "INSERTED").forEach(_ => onInsertion(_))
                        List(files).filter(_ => _.state === "DELETED").forEach(_ => onDeletion(_))
                    })
                })

                resolve(job)
            } catch (error) {
                reject(error)
            }
        })
    }
}