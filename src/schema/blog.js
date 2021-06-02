import mongoose from "mongoose"

const { Schema, model } = mongoose

const commentSchema = new Schema(
    {
        comment: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true }
    },
    { timestamps: true }
)

const blogSchema = new Schema(
    {
        category: { type: String, required: true },
        title: { type: String, required: true },
        cover: { type: String, required: true }, // validate as functional http link on creation
        readTime: {
            value: { type: Number, required: true, max: 5, min: 1 },
            unit: { type: String, required: true }
        },
        author: {
            name: { type: String, required: true },
            avatar: { type: String, required: true }
        },
        content: { type: String, required: true },
        comments: { type: [commentSchema], default: [] }
    },
    { timestamps: true }
)

export default model("Blog", blogSchema)
