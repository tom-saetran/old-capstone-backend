import express from "express"
import { getUsers } from "../handlers/files.js"
import { userSignup } from "../handlers/validators.js"

const userRouter = express.Router()

userRouter.get("/", async (req, res, next) => {
    let result = await getUsers()

    // ######## FILTER USERS BY QUERIES
    if (req.query.name) result = result.filter(user => user.name.toLowerCase().includes(req.query.name.toLowerCase()))
    if (req.query.age) result = result.filter(user => user.age === req.query.age)

    res.send(result)

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
