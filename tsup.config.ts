import { defineConfig } from "tsup"
/** @type {import("tsup").Options} */
export default defineConfig({
    sourcemap: true,
    dts: true,
    clean: true,
    format: ["esm", "cjs"],
    entry: ["src/index.ts"],
})
