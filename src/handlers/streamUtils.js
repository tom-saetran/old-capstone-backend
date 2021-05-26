import { Transform } from "stream"

export const map = (fn, options = {}) =>
    new Transform({
        // By default we are in object mode but this can be overwritten by the user
        objectMode: true,
        ...options,

        transform(chunk, encoding, callback) {
            let res
            try {
                res = fn(chunk)
            } catch (e) {
                return callback(e)
            }
            callback(null, res)
        }
    })

export const filter = (fn, options = {}) =>
    new Transform({
        objectMode: true,
        ...options,

        transform(chunk, encoding, callback) {
            let take
            try {
                take = fn(chunk)
            } catch (e) {
                return callback(e)
            }
            return callback(null, take ? chunk : undefined)
        }
    })

export const reduce = (fn, acc, options = {}) =>
    new Transform({
        objectMode: true,
        ...options,

        transform(chunk, encoding, callback) {
            try {
                acc = fn(acc, chunk)
            } catch (e) {
                return callback(e)
            }
            return callback()
        },

        flush(callback) {
            callback(null, acc)
        }
    })
