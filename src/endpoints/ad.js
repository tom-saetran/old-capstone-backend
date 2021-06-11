import express from "express"
import createError from "http-errors"
import adModel from "../schema/ad.js"

const adRouter = express.Router()

adRouter.get("/", async (req, res, next) => {
    try {
        const all = await adModel.find()
        res.status(200).send(all)
    } catch (error) {
        next(error)
    }
})

adRouter.get("/some", async (req, res, next) => {
    try {
        const all = await adModel.find()
        const some = () =>
            all
                .map(a => [a, Math.random()])
                .sort((a, b) => (a[1] < b[1] ? -1 : 1))
                .slice(0, 4 + Math.random() * 2)
                .map(a => a[0])

        res.status(200).send(some())
    } catch (error) {
        next(error)
    }
})

adRouter.get("/:id", async (req, res, next) => {
    try {
        const result = await adModel.findById(req.params.id)
        if (!result) next(createError(400, "id not found"))
        else res.status(200).send(result)
    } catch (error) {
        console.log(error)
        next(error.message)
    }
})

adRouter.post("/", async (req, res, next) => {
    try {
        const result = new adModel(req.body)
        if (await result.save()) res.status(201).send(result._id)
        else next(createError(500, "Error saving data!"))
    } catch (error) {
        next(error)
    }
})

adRouter.put("/:id", async (req, res, next) => {
    try {
        const result = await adModel.findByIdAndUpdate(
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

adRouter.delete("/:id", async (req, res, next) => {
    try {
        const result = await adModel.findByIdAndDelete(req.params.id)
        if (result) res.send("Deleted")
        else next(createError(404, `ID ${req.params.id} not found`))
    } catch (error) {
        next(error)
    }
})

export default adRouter
