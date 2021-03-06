import mongoose from "mongoose"

const { Schema, model } = mongoose

const commentSchema = new Schema({
    comment: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const blogSchema = new Schema(
    {
        category: { type: String, required: true },
        title: { type: String, required: true },
        cover: { type: String, default: null },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        comments: { type: [commentSchema], default: [] },
        likes: [{ type: Schema.Types.ObjectId, ref: "User", required: true }]
    },
    { timestamps: true }
)

export default model("Blog", blogSchema)
