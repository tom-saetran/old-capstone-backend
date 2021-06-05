import express from "express"
import multer from "multer"
import { userSignup } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import q2m from "query-to-mongo"
import createError from "http-errors"

import userModel from "../schema/user.js"

const userRouter = express.Router()

userRouter.get("/", async (req, res, next) => {
    try {
        const query = q2m(req.query)
        const total = await userModel.countDocuments(query.criteria)
        const limit = 25
        const result = await userModel
            .find(query.criteria)
            .sort(query.options.sort)
            .skip(query.options.skip || 0)
            .limit(query.options.limit && query.options.limit < limit ? query.options.limit : limit)
        res.status(200).send({ links: query.links("/users", total), total, result })
    } catch (error) {
        next(error)
    }
})

userRouter.get("/asCSV", (req, res, next) => {
    try {
        const fields = ["name", "surname"]
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
        //pipeline(readUsersStream(), new Transform({ fields }), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id", async (req, res, next) => {
    try {
        const result = await userModel.findById(req.params.id)
        if (!result) next(createError(400, "id not found"))
        else res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

userRouter.post("/", userSignup, async (req, res, next) => {
    try {
        const entry = new userModel(req.body) // validation happens here against schema
        const result = await entry.save()
        res.status(201).send(result._id)
    } catch (error) {
        next(error)
    }
})

userRouter.put("/:id", userSignup, async (req, res, next) => {
    try {
        const result = await userModel.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true,
            new: true,
            useFindAndModify: false
        })
        if (!result) next(createError(400, "ID not found"))
        else res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

userRouter.delete("/:id", async (req, res, next) => {
    try {
        const result = await userModel.findByIdAndDelete(req.params.id, { useFindAndModify: false })
        if (result) res.status(200).send("Deleted")
        else next(createError(400, "ID not found"))
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
}).single("avatar")

userRouter.post("/:id/avatar", upload, async (req, res, next) => {
    try {
        console.log(req.file)
        const result = await userModel.findByIdAndUpdate(
            req.params.id,
            { $set: { avatar: req.file.path } },
            { new: true, useFindAndModify: false }
        )
        if (result) res.status(200).send(result)
        else next(createError(400, "ID not found"))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id/asPDF", (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`)
        //pipeline(generatePDFStream(), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})

userRouter.post("/:id/purchaseHistory/", async (req, res, next) => {
    try {
        const bookId = req.body.bookId
        const purchasedBook = await BookModel.findById(bookId, { _id: 0 })
        if (purchasedBook) {
            const bookToInsert = { ...purchasedBook.toObject(), date: new Date() }

            const updatedUser = await userModel.findByIdAndUpdate(
                req.params.id,
                { $push: { purchaseHistory: bookToInsert } },
                { runValidators: true, new: true, useFindAndModify: false }
            )
            if (updatedUser) res.send(updatedUser)
            else next(createError(404, `User ${req.params.id} not found`))
        } else next(createError(404, `Book ${req.body.bookId} not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id/purchaseHistory/", async (req, res, next) => {
    try {
        const user = await userModel.findById(req.params.id, {
            purchaseHistory: 1,
            _id: 0
        })
        if (user) res.send(user.purchaseHistory)
        else next(createError(404, `User ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id/purchaseHistory/:bookId", async (req, res, next) => {
    try {
        const user = await userModel.findOne(
            { _id: req.params.id },
            { purchaseHistory: { $elemMatch: { _id: req.params.bookId } } }
        )
        if (user) {
            if (user.purchaseHistory && user.purchaseHistory.length > 0) res.send(user.purchaseHistory[0])
            else next(createError(404, `Book ${req.params.bookId} not found in purchase history`))
        } else next(createError(404, `Student ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.delete("/:id/purchaseHistory/:bookId", async (req, res, next) => {
    try {
        const user = await userModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { purchaseHistory: { _id: req.params.bookId } } },
            { new: true, useFindAndModify: false }
        )
        if (user) res.send(user)
        else next(createError(404, `Student ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.put("/:id/purchaseHistory/:bookId", async (req, res, next) => {
    try {
        const user = await userModel.findOneAndUpdate(
            {
                _id: req.params.id,
                "purchaseHistory._id": req.params.bookId
            },
            { $set: { "purchaseHistory.$": req.body } },
            {
                runValidators: true,
                new: true,
                useFindAndModify: false
            }
        )
        if (user) {
            res.send(user)
        } else {
            next(createError(404, `Student ${req.params.id} not found`))
        }
    } catch (error) {
        console.log(error)
        next(createError(500, "An error occurred while deleting student"))
    }
})

export default userRouter
