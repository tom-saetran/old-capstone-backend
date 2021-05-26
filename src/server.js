import express from "express"
import cors from "cors"
import uniqid from "uniqid"
import fs from "fs-extra"
import listEndpoints from "express-list-endpoints"

import { errorBadRequest, errorForbidden, errorNotFound, errorDefault } from "./handlers/errors.js"
import { staticPath, loggerJSON, notAnAPI } from "./handlers/files.js"
import userRouter from "./endpoints/user.js"
import blogPostRouter from "./endpoints/blogposts.js"

const server = express()
const port = process.env.PORT || 1234

// ##### Initial Setups #####
const whitelist = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_PROD_URL]
const corsOptions = {
    origin: (origin, next) => {
        if (whitelist.indexOf(origin) !== -1) {
            next(null, true)
        } else {
            next(new Error("CORS!"))
        }
    }
}

server.use(express.json())

// CORS-Disabled index.html
server.route("/").get((req, res, next) => {
    try {
        res.sendFile(notAnAPI)
    } catch (error) {
        next(error)
    }
})

server.use(cors(corsOptions))
server.use(express.static(staticPath))

// ##### Global Middleware #####
const logger = async (req, res, next) => {
    const content = await fs.readJSON(loggerJSON)

    content.push({
        method: req.method,
        resource: req.url,
        query: req.query,
        body: req.body,
        _id: uniqid(),
        _timeStamp: new Date()
    })

    await fs.writeJSON(loggerJSON, content)
    next()
}
server.use(logger)

// ##### Routes #####
server.use("/users", userRouter)
server.use("/blogs", blogPostRouter)

// ##### Error Handlers #####
server.use(errorBadRequest)
server.use(errorForbidden)
server.use(errorNotFound)
server.use(errorDefault)

// ##### Start Server #####
server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("server is running on port: ", port)
})
