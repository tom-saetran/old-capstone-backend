import { fileURLToPath } from "url"
import { dirname, join } from "path"

export const notAnAPI = join(dirname(fileURLToPath(import.meta.url)), "../data/notAPI.html")
export const ymlAPI = join(dirname(fileURLToPath(import.meta.url)), "../../docs/api.yml")
export const jsonAPI = join(dirname(fileURLToPath(import.meta.url)), "../../docs/api.json")
export const staticPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/")
export const loggerJSON = join(dirname(fileURLToPath(import.meta.url)), "../log.json")
