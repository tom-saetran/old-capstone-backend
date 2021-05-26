import express from "express"
import multer from "multer"
import { readBlogsStream } from "../handlers/files.js"
import { blogValidator } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"
import createError from "http-errors"
import { filter } from "../handlers/streamUtils.js"
import generatePDFStream from "../handlers/pdfout.js"

const blogPostRouter = express.Router()

blogPostRouter.get("/", (req, res, next) => {
    try {
        let result = readBlogsStream()
        pipeline(
            result,
            filter(blog => (req.query.name ? blog.name.toLowerCase().includes(req.query.name) : blog)),
            filter(blog => (req.query.age ? blog.age === req.query.age : blog)),
            res,
            err => (err ? createError(500, err) : null)
        )
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id", (req, res, next) => {
    try {
        let result = readBlogsStream()
        pipeline(
            result,
            filter(blog => blog.id === req.params.id),
            res,
            err => (err ? createError(500, err) : null)
        )
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

blogPostRouter.post("/:id/cover", upload, (req, res, next) => {
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
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`)
        pipeline(source, res, error => next(error))
    } catch (error) {
        next(error)
    }
})

export default blogPostRouter
