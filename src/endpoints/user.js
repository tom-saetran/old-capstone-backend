import express from "express"
import { userSignup } from "../handlers/validators.js"

const userRouter = express.Router()

userRouter.get("/", async (req, res, next) => {
    try {
        res.status(501).send()
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
userRouter.put("/:id", async (req, res, next) => {
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
