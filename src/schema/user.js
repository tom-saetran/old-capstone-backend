import mongoose from "mongoose"

const { Schema, model } = mongoose

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: String,
        email: String,
        age: Number,
        professions: [String],
        purchaseHistory: [
            {
                asin: String,
                title: String,
                price: Number,
                category: String,
                date: Date
            }
        ]
    },
    { timestamps: true }
)

export default model("User", userSchema)
