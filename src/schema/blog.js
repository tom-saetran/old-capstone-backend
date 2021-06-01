import mongoose from "mongoose"

const { Schema, model } = mongoose

const blogSchema = new Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true }, // validate as functional http link on creation
    readTime: {
        value: { type: Number, required: true, max: 5, min: 1 },
        unit: { type: String, required: true }
    },
    author: {
        name: { type: String, required: true },
        avatar: { type: String, required: true } // validate as functional http link on creation
    },
    content: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true }
})

export default model("Blog", blogSchema)
