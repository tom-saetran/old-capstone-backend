import express from "express"
import multer from "multer"
import { readBlogsStream } from "../handlers/files.js"
import { blogValidator } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"
import createError from "http-errors"
import { map, filter } from "../handlers/streamUtils.js"

const blogPostRouter = express.Router()

blogPostRouter.get("/", (req, res, next) => {
    try {
        let result = readBlogsStream()

        //if (req.query.name) result = result.filter(blog => blog.name.toLowerCase().includes(req.query.name.toLowerCase()))

        pipeline(
            result,
            filter(blog => JSON.parse(blog).name === req.query.name),
            res,
            err => (err ? console.log(err) : "")
        )
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id", (req, res, next) => {
    try {
        let result = readBlogsStream()
        result = result.filter(blog => blog.id === req.params.id)
        if (!result) createError(404, `Blog with id ${req - params.id} was not found.`)
        else {
            res.send(result)
        }
    } catch (error) {
        next(error)
    }
})

blogPostRouter.post("/", blogValidator, async (req, res, next) => {
    try {
        res.status(501).send()
    } catch (error) {
        next(error)
    }
})

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "avatars"
    }
})

const upload = multer({
    storage: cloudinaryStorage
}).single("cover")

blogPostRouter.post("/cover", upload, (req, res, next) => {
    try {
        console.log(req.file)
        // TODO: add url to current user
        res.status(200).send("OK")
    } catch (error) {
        next(error)
    }
})

blogPostRouter.put("/:id", blogValidator, async (req, res, next) => {
    try {
        res.status(501).send()
    } catch (error) {
        next(error)
    }
})

blogPostRouter.delete("/:id", async (req, res, next) => {
    try {
        res.status(501).send()
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id/asPDF", async (req, res, next) => {
    try {
        const source = generatePDFStream()
        const destination = res
        res.setHeader("Content-Disposition", "attachment; filename=export.pdf")
        pipeline(source, destination, err => next(err))
    } catch (error) {
        next(error)
    }
})

export default blogPostRouter
