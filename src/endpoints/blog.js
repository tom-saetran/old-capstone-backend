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
import blogModel from "../schema/blog.js"
import q2m from "query-to-mongo"

const blogPostRouter = express.Router()

blogPostRouter.get("/", async (req, res, next) => {
    try {
        const query = q2m(req.query)
        const total = await blogModel.countDocuments(query.criteria)
        const limit = 2
        const result = await blogModel
            .find(query.criteria)
            .sort(query.options.sort)
            .skip(query.options.skip || 0)
            .limit(query.options.limit && query.options.limit < limit ? query.options.limit : limit)
        res.status(200).send({ links: query.links("/blogs", total), total, result })
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

blogPostRouter.get("/:id", async (req, res, next) => {
    try {
        const result = await blogModel.findById(req.params.id)
        if (!result) createError(400, "id not found")
        else res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

blogPostRouter.post("/", blogValidator, async (req, res, next) => {
    try {
        const entry = req.body
        const newUser = new blogModel(entry)
        const { _id } = await newUser.save()
        res.status(201).send(_id)
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

blogPostRouter.post("/:id/cover", upload, async (req, res, next) => {
    try {
        console.log(req.file)
        const result = await blogModel.findByIdAndUpdate(
            req.params.id,
            { $set: { cover: req.file.path } },
            { useFindAndModify: false }
        ) // no work
        if (result) res.status(200).send(req.file.path)
        else createError(400, "ID not found")
    } catch (error) {
        next(error)
    }
})

blogPostRouter.put("/:id", blogValidator, async (req, res, next) => {
    try {
        const result = await blogModel.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { runValidators: true, new: true, useFindAndModify: false }
        )
        if (result) res.status(200).send(result)
        else createError(400, "ID not found")
    } catch (error) {
        next(error)
    }
})

blogPostRouter.delete("/:id", async (req, res, next) => {
    try {
        const result = await blogModel.findByIdAndRemove(req.params.id, { useFindAndModify: false })
        if (result) res.status(200).send("Deleted")
        else createError(400, "ID not found")
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

blogPostRouter.post("/:id", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findById(req.params.id)
        if (blogPost) {
            const result = await blogModel.findByIdAndUpdate(
                req.params.id,
                { $push: { comments: { ...req.body, date: new Date() } } },
                { runValidators: true, new: true, useFindAndModify: false }
            )
            if (result) res.send(result)
            else createError(404, `Failed to add comment to ${req.params.id}`)
        } else createError(404, `Blog Post ${req.params.id} not found`)
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id/comments/", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findById(req.params.id, {
            comments: 1,
            _id: 0
        })
        if (blogPost) res.send(blogPost.comments)
        else createError(404, `Blog Post ${req.params.id} not found`)
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id/comments/:commentId", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findOne(
            { _id: req.params.id },
            { comments: { $elemMatch: { _id: req.params.commentId } } }
        )

        if (blogPost) {
            if (blogPost.comments && blogPost.comments.length > 0) res.send(blogPost.comments[0])
            else createError(404, `Comment ${req.params.commentId} not found`)
        } else createError(404, `Blog Post ${req.params.id} not found`)
    } catch (error) {
        next(error)
    }
})

blogPostRouter.delete("/:id/comment/:commentId", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { comments: { _id: req.params.commentId } } },
            { new: true, useFindAndModify: false }
        )

        if (blogPost) res.send(blogPost)
        else createError(404, `Blog Post ${req.params.id} not found`)
    } catch (error) {
        next(error)
    }
})

blogPostRouter.put("/:id/comment/:commentId", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findOneAndUpdate(
            { _id: req.params.id, "comments._id": req.params.commentId },
            { $set: { "comments.$": { ...req.body, date: new Date() } } },
            { runValidators: true, new: true, useFindAndModify: false }
        )

        if (blogPost) res.send(blogPost)
        else createError(404, `Blog Post ${req.params.id} not found`)
    } catch (error) {
        next(error)
    }
})

export default blogPostRouter
