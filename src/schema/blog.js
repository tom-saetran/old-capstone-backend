import mongoose from "mongoose"

const { Schema, model } = mongoose

const commentSchema = new Schema({
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const blogSchema = new Schema(
    {
        category: { type: String, required: true },
        title: { type: String, required: true },
        cover: { type: String, default: "https://via.placeholder.com/420x200?text=Cover%20Banner" },
        readTime: {
            value: { type: Number, required: true, min: 1, max: 5 },
            unit: { type: String, required: true }
        },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        comments: { type: [commentSchema], default: [] },
        likes: { type: Number, default: 0 }
    },
    { timestamps: true }
)

export default model("Blog", blogSchema)
