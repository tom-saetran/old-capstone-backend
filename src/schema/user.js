import mongoose from "mongoose"

const { Schema, model } = mongoose

const experienceSchema = new Schema({
    field: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: "" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const educationSchema = new Schema({
    field: { type: String, required: true },
    description: { type: String, required: true },
    degree: { type: String, required: true },
    institute: { type: Schema.Types.ObjectId, ref: "Institute", default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const employmentSchema = new Schema({
    field: { type: String, required: true },
    description: { type: String, required: true },
    occupation: { type: String, required: true },
    employer: { type: Schema.Types.ObjectId, ref: "Business", default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: "" },
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
})

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        avatar: { type: String, default: "https://via.placeholder.com/420?text=User%20Avatar" },
        description: { type: String, required: true },
        biograpghy: { type: String, default: "" },
        roles: {
            isAdministrator: { type: String, default: false, immutable: true, required: true },
            isSuperUser: { type: String, default: false, immutable: true, required: true },
            isModerator: { type: String, default: false, immutable: true, required: true }
        },
        blogs: [{ type: Schema.Types.ObjectId, ref: "Blog", required: true }],
        experiences: { type: [experienceSchema], default: [] },
        educations: { type: [educationSchema], default: [] },
        employments: { type: [employmentSchema], default: [] }
    },
    { timestamps: true }
)

export default model("User", userSchema)
