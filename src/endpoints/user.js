import express from "express"
import multer from "multer"
import { readUsersStream } from "../handlers/files.js"
import { userSignup } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { pipeline } from "stream"

const userRouter = express.Router()

userRouter.get("/", async (req, res, next) => {
    try {
        let result = readUsersStream()

        if (req.query.name) result = result.filter(user => user.name.toLowerCase().includes(req.query.name.toLowerCase()))
        if (req.query.age) result = result.filter(user => user.age === req.query.age)

        pipeline(result, res, err => console.log(err))
    } catch (error) {
        next(error)
    }
})

userRouter.get("/:id", async (req, res, next) => {
    try {
        res.status(501).send()
    } catch (error) {
        next(error)
    }
})

userRouter.post("/", userSignup, async (req, res, next) => {
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

userRouter.put("/:id", userSignup, async (req, res, next) => {
    try {
        res.status(501).send()
    } catch (error) {
        next(error)
    }
})

userRouter.delete("/:id", async (req, res, next) => {
    try {
        res.status(501).send()
    } catch (error) {
        next(error)
    }
})

export default userRouter
