import express from "express"
import multer from "multer"
import { userSignup } from "../handlers/validators.js"
import userModel from "../schema/user.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import q2m from "query-to-mongo"
import createError from "http-errors"
import mongoose from "mongoose"
const { isValidObjectId } = mongoose

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
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else {
            const result = await userModel.findById(req.params.id).populate("blogs")
            if (!result) next(createError(404, `ID ${req.params.id} was not found`))
            else res.status(200).send(result)
        }
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

userRouter.post("/updateDB", async (req, res, next) => {
    try {
        if (userModel.validate()) res.status(200).send("DB Updated")
    } catch (error) {
        next(error)
    }
})

userRouter.put("/:id", userSignup, async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else result = await userModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true, useFindAndModify: false })

        if (!result) next(createError(404, `ID ${req.params.id} was not found`))
        else res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

userRouter.delete("/:id", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else result = await userModel.findByIdAndDelete(req.params.id, { useFindAndModify: false })

        if (result) res.status(200).send("Deleted")
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

const cloudinaryStorage = new CloudinaryStorage({ cloudinary, params: { folder: "avatars" } })
const upload = multer({ storage: cloudinaryStorage }).single("avatar")
userRouter.post("/:id/avatar", upload, async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else
            result = await userModel.findByIdAndUpdate(
                req.params.id,
                { $set: { avatar: req.file.path } },
                { new: true, useFindAndModify: false, timestamps: false }
            )

        if (result) res.status(200).send(result)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id/asPDF", (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`)
        //pipeline(generatePDFStream(), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})

userRouter.post("/:id/purchaseHistory/", async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else {
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
                else next(createError(404, `ID ${req.params.id} not found`))
            } else next(createError(404, `ID ${req.body.bookId} not found`))
        }
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id/purchaseHistory/", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else result = await userModel.findById(req.params.id, { purchaseHistory: 1, _id: 0 })

        if (result) res.send(result.purchaseHistory)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id/purchaseHistory/:bookId", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.bookId)) next(createError(400, `ID ${req.params.bookId} is invalid`))
        else result = await userModel.findOne({ _id: req.params.id }, { purchaseHistory: { $elemMatch: { _id: req.params.bookId } } })

        if (result) {
            if (result.purchaseHistory && result.purchaseHistory.length > 0) res.send(result.purchaseHistory[0])
            else next(createError(404, `ID ${req.params.bookId} was not found`))
        } else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.delete("/:id/purchaseHistory/:bookId", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.bookId)) next(createError(400, `ID ${req.params.bookId} is invalid`))
        else
            result = await userModel.findByIdAndUpdate(
                req.params.id,
                { $pull: { purchaseHistory: { _id: req.params.bookId } } },
                { new: true, useFindAndModify: false }
            )

        if (result) res.send(result)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

userRouter.put("/:id/purchaseHistory/:bookId", async (req, res, next) => {
    try {
        let result
        if (!isValidObjectId(req.params.id)) next(createError(400, `ID ${req.params.id} is invalid`))
        else if (!isValidObjectId(req.params.bookId)) next(createError(400, `ID ${req.params.bookId} is invalid`))
        else
            result = await userModel.findOneAndUpdate(
                { _id: req.params.id, "purchaseHistory._id": req.params.bookId },
                { $set: { "purchaseHistory.$": req.body } },
                { runValidators: true, new: true, useFindAndModify: false }
            )

        if (result) res.send(result)
        else next(createError(404, `ID ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

export default userRouter
