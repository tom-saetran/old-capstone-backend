import mongoose from "mongoose"

const { Schema, model } = mongoose

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        avatar: { type: String, default: "https://via.placeholder.com/420?text=User%20Avatar" }
    },
    { timestamps: true }
)

export default model("User", userSchema)
