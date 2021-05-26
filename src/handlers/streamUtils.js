import { Transform } from "stream"

export const map = (fn, options = {}) =>
    new Transform({
        objectMode: true,
        ...options,

        transform(chunk, encoding, callback) {
            let res
            try {
                res = fn(chunk)
            } catch (error) {
                return callback(error)
            }
            callback(null, res)
        }
    })

export const filter = (fn, options = {}) =>
    new Transform({
        objectMode: true,
        ...options,

        transform(chunk, encoding, callback) {
            try {
                const parsed = JSON.parse(chunk)
                const take = parsed.filter(fn)
                return callback(null, true ? JSON.stringify(take) : undefined)
            } catch (error) {
                return callback(error)
            }
        }
    })

export const reduce = (fn, acc, options = {}) =>
    new Transform({
        objectMode: true,
        ...options,

        transform(chunk, encoding, callback) {
            try {
                acc = fn(acc, chunk)
            } catch (error) {
                return callback(error)
            }
            return callback()
        },

        flush(callback) {
            callback(null, acc)
        }
    })
