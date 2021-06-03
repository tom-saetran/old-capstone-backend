import express from "express"
import cors from "cors"
import uniqid from "uniqid"
import fs from "fs-extra"
import listEndpoints from "express-list-endpoints"
import swaggerUI from "swagger-ui-express"
import YAML from "yamljs"
import mongoose from "mongoose"

import { errorBadRequest, errorForbidden, errorNotFound, errorDefault } from "./handlers/errors.js"
import { staticPath, loggerJSON, notAnAPI } from "./handlers/files.js"
import userRouter from "./endpoints/user.js"
import blogPostRouter from "./endpoints/blog.js"
import sendEmailTest from "./handlers/email.js"
import { ymlAPI, jsonAPI } from "./handlers/files.js"

import createError from "http-errors"

import logModel from "./schema/log.js"

const server = express()
const port = process.env.PORT || 1234

// ##### Initial Setups #####
const whitelist = [process.env.FRONTEND_DEV_URL, process.env.FRONTEND_PROD_URL]
const corsOptions = {
    origin: (origin, next) => {
        try {
            if (whitelist.indexOf(origin) !== -1) {
                next(null, true)
            } else {
                next(createError(400, "Cross-Site Origin Policy blocked your request"), true)
            }
        } catch (error) {
            next(error)
        }
    }
}

server.use(express.json()) // Unlocks reading JSON in req.body. Without it, req.body would be undefined.

// CORS-Disabled routes
server.route("/").get((req, res, next) => {
    try {
        res.sendFile(notAnAPI)
    } catch (error) {
        next(error)
    }
})

//console.log(ymlAPI)
//console.log(jsonAPI)
server.use("/docs", swaggerUI.serve, swaggerUI.setup(YAML.load(ymlAPI)))
//server.use("/docs", swaggerUI.serve, swaggerUI.setup( YAML.load( YAML.parse( JSON.stringify( jsonAPI)))))

server.use(cors(corsOptions))
server.use(express.static(staticPath))

// ### EMAIL TEST
server.route("/emailtest").post(async (req, res, next) => {
    try {
        if (!req.body.email) createError(400, "Email not supplied")
        else {
            await sendEmailTest(req.body.email)
            res.send("Sent")
        }
    } catch (error) {
        next(error)
    }
})

// ##### Global Middleware #####
const logger = async (req, res, next) => {
    try {
        const entry = new logModel({
            method: req.method,
            query: req.query,
            params: req.params,
            body: req.body
        })
        await entry.save()
        next()
    } catch (error) {
        next(error)
    }

    /*const content = await fs.readJSON(loggerJSON)

    content.push({
        method: req.method,
        resource: req.url,
        query: req.query,
        body: req.body,
        _id: uniqid(),
        _timeStamp: new Date()
    })

    await fs.writeJSON(loggerJSON, content)
    next()*/
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
mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    server.listen(port, () => {
        console.table(listEndpoints(server))
        console.log("server is running on port: ", port)
    })
})
