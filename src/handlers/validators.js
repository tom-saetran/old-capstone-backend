import { body } from "express-validator"

export const userSignup = [
    //body("name").exists().withMessage("Name is a mandatory field!"),
    //body("surname").exists().isLength({ min: 5 }).withMessage("Description is mandatorty and needs to be more than 50 characters!"),
    //body("email").exists().isLength({ max: 50 }).withMessage("Brand is a mandatory field!"),
    //body("price").exists().isInt().withMessage("Price is a mandatory field and needs to be an integer!"),
    //body("category").exists().withMessage("Category is a mandatory field!")
]

export const blogValidator = [
    body("category").exists().withMessage("Category is a mandatory field").isString().withMessage("Category is of wrong type"),
    body("title").exists().withMessage("Title is a mandatory field").isString().withMessage("Title is of wrong type"),
    body("cover").isURL().withMessage("Cover needs to be of type URL if present"),
    body("content").exists().withMessage("Content is a mandatory field").isString().withMessage("Content is of wrong type"),
    
    // Object readTime
    body("readTime").exists().withMessage("Read Time is a mandatory object").isObject().withMessage("Read Time is of wrong type"),
    body("readTime.value").exists().withMessage("Read Time => Value is a mandatory field").isNumeric({min: 0, max: 800}).withMessage("Read Time => Value is of wrong type or out of bonds"),
    body("readTime.unit").exists().withMessage("Read Time => Unit is a mandatory field").isString().withMessage("Read Time => Unit is of wrong type"),
    
    // TEMP:
    body("author").exists().withMessage("Author Unit is a object").isString().withMessage("Author is of wrong type"),
    body("author.name").exists().withMessage("Author => Name is a mandatory field").isString().withMessage("Author => Name is of wrong type"),
    body("author.avatar").exists().withMessage("Author => Avatar is a mandatory field").isString().withMessage("Author => Avatar is of wrong type"),
]
