import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, createReadStream, createWriteStream } = fs

const usersJSON = join(dirname(fileURLToPath(import.meta.url)), "../data/users.json")
const blogsJSON = join(dirname(fileURLToPath(import.meta.url)), "../data/blogs.json")
export const notAnAPI = join(dirname(fileURLToPath(import.meta.url)), "../data/notAPI.html")

export const readUsersStream = () => createReadStream(usersJSON)
export const readBlogsStream = () => createReadStream(blogsJSON)

//export const writeUsersStream = createWriteStream(usersJSON)
//export const writeBlogsStream = createWriteStream(blogsJSON)
export const writeUsers = async content => await writeJSON(usersJSON, content)
export const writeBlogs = async content => await writeJSON(blogsJSON, content)

export const staticPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/")
export const loggerJSON = join(dirname(fileURLToPath(import.meta.url)), "../log.json")
