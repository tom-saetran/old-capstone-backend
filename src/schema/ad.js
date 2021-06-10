import mongoose from "mongoose"

const { Schema, model } = mongoose

const adSchema = new Schema(
    {
        title: { type: String, required: true },
        outText: { type: String, required: true },
        outId: { type: String, required: true },
        outLink: { type: String, required: true }
    },
    { timestamps: true }
)

export default model("Ad", adSchema)
