import express from "express"
import multer from "multer"
import { blogValidator } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import createError from "http-errors"
import blogModel from "../schema/blog.js"
import userModel from "../schema/user.js"
import q2m from "query-to-mongo"

const blogPostRouter = express.Router()

blogPostRouter.get("/", async (req, res, next) => {
    try {
        const query = q2m(req.query)
        const total = await blogModel.countDocuments(query.criteria)
        const limit = 100
        const result = await blogModel
            .find(query.criteria)
            .sort(query.options.sort)
            .skip(query.options.skip || 0)
            .limit(query.options.limit && query.options.limit < limit ? query.options.limit : limit)
            .populate("author")
            .populate("comments.author")
        res.status(200).send({ links: query.links("/blogs", total), total, result })
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id", async (req, res, next) => {
    try {
        const result = await blogModel.findById(req.params.id).populate("author").populate("comments.author")
        if (!result) next(createError(400, "id not found"))
        else res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

blogPostRouter.post("/", blogValidator, async (req, res, next) => {
    try {
        const entry = req.body
        const result = new blogModel(entry)

        if (await result.save()) {
            if (
                await userModel.findByIdAndUpdate(
                    result.author,
                    { $push: { blogs: result._id } },
                    { runValidators: true, new: true, useFindAndModify: false }
                )
            )
                res.status(201).send(result._id)
            else next(createError(400, "author id is invalid"))
        } else next(createError(500, "Error saving data!"))
    } catch (error) {
        next(error)
    }
})

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: { folder: "avatars" }
})

const upload = multer({
    storage: cloudinaryStorage
}).single("cover")

blogPostRouter.post("/:id/cover", upload, async (req, res, next) => {
    try {
        const result = await blogModel.findByIdAndUpdate(
            req.params.id,
            { $set: { cover: req.file.path } },
            { new: true, useFindAndModify: false }
        )

        if (result) res.status(200).send(result)
        else next(createError(400, "ID not found"))
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
        else next(createError(400, "ID not found"))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.delete("/:id", async (req, res, next) => {
    try {
        const result1 = await blogModel.findByIdAndRemove(req.params.id, { useFindAndModify: false })
        const result2 = await userModel.blogs.findByIdAndRemove(req.params.id, { useFindAndModify: false })
        if (result1 && result2) res.status(200).send("Deleted")
        else next(createError(400, "ID not found"))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.get("/:id/asPDF", (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`)
        //pipeline(generatePDFStream(), res, error => (error ? createError(500, error) : null))
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
                { $push: { comments: { ...req.body, createdAt: new Date(), updatedAt: new Date() } } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) {
                res.send(result.comments[result.comments.length - 1])
            } else next(createError(404, `Failed to add comment to ${req.params.id}`))
        } else next(createError(404, `Blog Post ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.post("/:id/like", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findById(req.params.id)
        if (blogPost) {
            const result = await blogModel.findByIdAndUpdate(
                req.params.id,
                { $addToSet: { likes: req.body.id } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) res.send(true)
            else next(createError(404, `Failed to add comment to ${req.params.id}`))
        } else next(createError(404, `Blog Post ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.post("/:id/unlike", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findById(req.params.id)
        if (blogPost) {
            const result = await blogModel.findByIdAndUpdate(
                req.params.id,
                { $pull: { likes: req.body.id } },
                { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
            )

            if (result) res.send(true)
            else next(createError(404, `Failed to add comment to ${req.params.id}`))
        } else next(createError(404, `Blog Post ${req.params.id} not found`))
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
        else next(createError(404, `Blog Post ${req.params.id} not found`))
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
            else next(createError(404, `Comment ${req.params.commentId} not found`))
        } else next(createError(404, `Blog Post ${req.params.id} not found`))
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
        else next(createError(404, `Blog Post ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

blogPostRouter.put("/:id/comment/:commentId", async (req, res, next) => {
    try {
        const blogPost = await blogModel.findOneAndUpdate(
            { _id: req.params.id, "comments._id": req.params.commentId },
            { $set: { "comments.$": { ...req.body, _id: req.params.commentId, updatedAt: new Date() } } },
            { timestamps: false, runValidators: true, new: true, useFindAndModify: false }
        )

        if (blogPost) res.send(blogPost)
        else next(createError(404, `Blog Post ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

export default blogPostRouter
