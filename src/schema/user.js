import mongoose from "mongoose"

const { Schema, model } = mongoose

const experienceSchema = new Schema({
    field: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: "" },
    createdAt: { type: Date, default: new Date(), immutable: true },
    updatedAt: { type: Date, default: new Date() }
})

const educationSchema = new Schema({
    field: { type: String, required: true },
    description: { type: String, required: true },
    degree: { type: String, required: true },
    institute: { type: Schema.Types.ObjectId, ref: "Institute", default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: new Date(), immutable: true },
    updatedAt: { type: Date, default: new Date() }
})

const employmentSchema = new Schema({
    field: { type: String, required: true },
    description: { type: String, required: true },
    occupation: { type: String, required: true },
    employer: { type: Schema.Types.ObjectId, ref: "Business", default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: "" },
    createdAt: { type: Date, default: new Date(), immutable: true },
    updatedAt: { type: Date, default: new Date() }
})

const rolesSchema = new Schema({
    isAdministrator: { type: Boolean, default: false, immutable: true, required: true },
    isSuperUser: { type: Boolean, default: false, immutable: true, required: true },
    isModerator: { type: Boolean, default: false, immutable: true, required: true }
})

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        surname: { type: String, required: true },
        avatar: { type: String, default: "https://via.placeholder.com/420?text=User%20Avatar" },
        description: { type: String, required: true },
        biography: { type: String, default: "" },
        roles: { type: { rolesSchema }, required: true },
        blogs: [{ type: Schema.Types.ObjectId, ref: "Blog", required: true }],
        experiences: { type: [experienceSchema], default: [], required: true },
        educations: { type: [educationSchema], default: [], required: true },
        employments: { type: [employmentSchema], default: [], required: true }
    },
    { timestamps: true }
)

export default model("User", userSchema)
