import json from "@rollup/plugin-json"
import dts from "rollup-plugin-dts"
import esbuild from "rollup-plugin-esbuild"

import {createRequire} from "module"

const require = createRequire(import.meta.url)
const pkg = require("./package.json")

export default [{
    input: "src/index.ts",
    plugins: [esbuild(), json()],
    output: [{file: pkg.main, format: "cjs"}, {file: pkg.module, format: "es"}],
    external: ["@damntools.fr/data", "@damntools.fr/types", "@damntools.fr/logger-simple", "@damntools.fr/utils-simple", "@damntools.fr/settings-parser", "@damntools.fr/sqlite", "sqlite3", "uuid", "fs", "path", "luxon"]
}, {
    input: ["src/index.types.ts"], output: [{file: pkg.types, format: "es"}], plugins: [dts()]
}]
