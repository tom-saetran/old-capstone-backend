import express from "express"
import cors from "cors"
import uniqid from "uniqid"
import fs from "fs-extra"
import listEndpoints from "express-list-endpoints"

import { fileURLToPath } from "url"
import { dirname, join } from "path"

import userRouter from "./endpoints/user.js"
import { errorBadRequest, errorForbidden, errorNotFound, errorDefault } from "./handlers/errors.js"

const server = express()
const port = 420

// ##### Initial Setup #####
server.use(cors())
server.use(express.json())
server.use(express.static(join(dirname(fileURLToPath(import.meta.url)), "../public/")))

// ##### Global Middleware #####
const logger = async (req, res, next) => {
    const content = await fs.readJSON(join(dirname(fileURLToPath(import.meta.url)), "log.json"))

    content.push({
        method: req.method,
        resource: req.url,
        query: req.query,
        body: req.body,
        _id: uniqid(),
        _timeStamp: new Date()
    })

    await fs.writeJSON(join(dirname(fileURLToPath(import.meta.url)), "log.json"), content)
    next()
}
server.use(logger)

// ##### Routes #####
server.use("/user", userRouter)

// ##### Error Handlers #####
server.use(errorBadRequest)
server.use(errorForbidden)
server.use(errorNotFound)
server.use(errorDefault)

// ##### Start Server #####
server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("server running on port: ", port)
})

console.log(server.routes)