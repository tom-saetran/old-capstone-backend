import mongoose from "mongoose"

const { Schema, model } = mongoose

const userSchema = new Schema({
    name: { type: String, required: true },
    surname: String,
    email: String,
    age: Number,
    professions: [String]
})

export default model("User", userSchema)
