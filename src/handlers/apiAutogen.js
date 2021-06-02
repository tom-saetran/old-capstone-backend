import swaggerAutogen from "swagger-autogen"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import YAML from "yaml"

const doc = {
    info: {
        title: "My API",
        description: "Description"
    },
    host: "localhost:3000",
    schemes: ["http"]
}

const outputFile = join(dirname(fileURLToPath(import.meta.url)), "../../docs/api.json")
const endpointsFiles = [join(dirname(fileURLToPath(import.meta.url)), "../server.js")]

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

const JSON2YAML = json => (new YAML.Document().contents = json)

swaggerAutogen()(outputFile, endpointsFiles, doc)
const yamltest = JSON2YAML(outputFile)
console.log(yamltest)
// TODO: BROKEN AF
// DO NOT SUE or USE!
