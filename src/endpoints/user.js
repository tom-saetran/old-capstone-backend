import express from "express"
import multer from "multer"
import { readUsersStream } from "../handlers/files.js"
import { userSignup } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"
import { Transform } from "json2csv"

import userModel from "../schema/user.js"

const userRouter = express.Router()

userRouter.get("/", async (req, res, next) => {
    try {
        const result = await userModel.find() // find all
        res.status(200).send(result)

        /*let result = readUsersStream()
        if (req.query.name) result = result.filter(user => user.name.toLowerCase().includes(req.query.name.toLowerCase()))
        if (req.query.age) result = result.filter(user => user.age === req.query.age)
        pipeline(result, res, err => console.log(err))*/
    } catch (error) {
        next(error)
    }
})

userRouter.get("/asCSV", (req, res, next) => {
    try {
        const fields = ["name", "surname"]
        res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.csv`)
        pipeline(readUsersStream(), new Transform({ fields }), res, error => (error ? createError(500, error) : null))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id", async (req, res, next) => {
    try {
        const result = await userModel.findById(req.params.id)
        if (!result) createError(400, "id not found")
        else res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

userRouter.post("/", userSignup, async (req, res, next) => {
    try {
        const newUser = new userModel(req.body) // validation happens here against schema
        const { _id } = await newUser.save()
        res.status(201).send(_id)
    } catch (error) {
        next(error)
    }
})

userRouter.put("/:id", userSignup, async (req, res, next) => {
    try {
        const result = await userModel.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true, useFindAndModify: false })
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

userRouter.delete("/:id", async (req, res, next) => {
    try {
        const result = await userModel.findByIdAndDelete(req.params.id)
        if (result) res.status(200).send("Deleted")
        else createError(400, "ID not found")
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
}).single("avatar")

userRouter.post("/avatar", upload, (req, res, next) => {
    try {
        console.log(req.file)
        // TODO: add url to current user
        res.status(200).send("OK")
    } catch (error) {
        next(error)
    }
})

export default userRouter
