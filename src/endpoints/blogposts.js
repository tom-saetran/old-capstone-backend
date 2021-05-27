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
import { Transform } from "json2csv"

const blogPostRouter = express.Router()

blogPostRouter.get("/", (req, res, next) => {
    try {
        pipeline(
            readBlogsStream(),
            filter(blog => (req.query.name ? blog.name.toLowerCase().includes(req.query.name) : blog)),
            filter(blog => (req.query.age ? blog.age === req.query.age : blog)), // etc...
            res,
            error => (error ? createError(500, error) : null)
        )
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/asCSV", (req, res, next) => {
    try {
        const fields = ["title", "content", "comments", "author", "cover"]
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
        pipeline(readBlogsStream(), new Transform({ fields }), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id", (req, res, next) => {
    try {
        pipeline(
            readBlogsStream(),
            filter(blog => blog.id === req.params.id),
            res,
            error => (error ? createError(500, error) : null)
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

blogPostRouter.get("/:id/asPDF", (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`)
        pipeline(generatePDFStream(), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id/asCSV", (req, res, next) => {
    try {
        const fields = ["title", "content", "comments", "author", "cover"]
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
        pipeline(
            readBlogsStream(),
            filter(user => user.id === req.params.id),
            new Transform({ fields }),
            res,
            error => (error ? createError(500, error) : null)
        )
    } catch (error) {
        next(error)
    }
})

export default blogPostRouter
