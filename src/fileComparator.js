const { Map, List } = require('immutable')

export default class FileComparator {
    constructor() {
        this.source = []
        this.target = []
    }

    compare(list) {
        return new Promise((resolve, reject) => {
            try {
                const files = List(list).filter(_ => _.type === "-")
                const deleted = FileComparator.checkDeletion(this.source, files)
                const inserted = FileComparator.checkInsertion(this.source, files)
                this.source = files

                resolve(deleted.merge(inserted).toJS())
            } catch (error) {
                reject(error)
            }
        })
    }

    static checkDeletion(source, target) {
        const difference = []
        for (let i = 0; i < source.size; i += 1) {
            let match = false
            for (let j = 0; j < target.size; j += 1) {
                if (JSON.stringify(source.get(i)) === JSON.stringify(target.get(j))) {
                    match = true
                    break
                }
            }
            if (match === false) {
                difference.push(Map(source.get(i)).merge({ state: "DELETED" }).toJS())
            }
        }
        return List(difference)
    }

    static checkInsertion(source, target) {
        const difference = []
        for (let i = 0; i < target.size; i += 1) {
            let match = false
            for (let j = 0; j < source.size; j += 1) {
                if (JSON.stringify(target.get(i)) === JSON.stringify(source.get(j))) {
                    match = true
                    break
                }
            }
            if (match === false) {
                difference.push(Map(target.get(i)).merge({ state: "INSERTED" }).toJS())
            }
        }
        return List(difference)
    }
}