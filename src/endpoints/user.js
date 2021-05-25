import express from "express"
import multer from "multer"
import { getUsers } from "../handlers/files.js"
import { userSignup } from "../handlers/validators.js"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

const userRouter = express.Router()

userRouter.get("/", async (req, res, next) => {
    try {
        let result = await getUsers()

        if (req.query.name) result = result.filter(user => user.name.toLowerCase().includes(req.query.name.toLowerCase()))
        if (req.query.age) result = result.filter(user => user.age === req.query.age)

        res.send(result)
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

userRouter.post("/avatar", upload, async (req, res, next) => {
    try {
        console.log(req.file)
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
