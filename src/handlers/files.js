import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON } = fs

export const staticPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/")
export const loggerJSON = join(dirname(fileURLToPath(import.meta.url)), "../log.json")

const usersJSON = join(dirname(fileURLToPath(import.meta.url)), "../data/users.json")

export const getUsers = async () => await readJSON(usersJSON)
export const writeUsers = async content => await writeJSON(usersJSON, content)
