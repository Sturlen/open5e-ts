import { afterAll, beforeAll, describe, expect, it } from "vitest"
import Open5eAPI from "./src"
import fetchMock from "fetch-mock"
import fs from "fs"

const barbarian = JSON.parse(
    fs.readFileSync("./fixtures/barbarian.json", "utf-8"),
)
const classes = JSON.parse(fs.readFileSync("./fixtures/classes.json", "utf-8"))
const races = JSON.parse(fs.readFileSync("./fixtures/races.json", "utf-8"))

const MONSTER_PATH = "/classes/"
const HOST = "https://api.example.com"
const ENDPOINT = `${HOST}${MONSTER_PATH}`
const api = Open5eAPI(HOST)

beforeAll(() => {
    fetchMock
        .get(`${ENDPOINT}barbarian`, barbarian)
        .get(`${ENDPOINT}not-a-class`, {
            status: 404,
            body: "Not Found",
        })
        .get(`${ENDPOINT}?limit=50`, classes)
        .get(`${HOST}/races/?limit=50`, races)
        .mock()
        .catch({ status: 400 })
})

afterAll(() => {
    fetchMock.restore()
})

describe("Get", () => {
    it("Gets a class by it's slug", async () => {
        const cls = await api.classes.get("barbarian")

        expect(cls?.name).toBe("Barbarian")
    })

    it("Return undefined if not found", async () => {
        const cls = await api.classes.get("not-a-class")

        expect(cls).toBe(undefined)
    })

    it("Throws if slug is empty", async () => {
        expect(() => api.classes.get("")).rejects.toThrow("Slug is required.")
    })
})

describe("findMany", () => {
    it("Parses using schema", async () => {
        const mons = await api.classes.findMany()

        expect(mons.length).toBe(12)
    })

    // TODO: class specific query tests. should not able to filter by challenge rating for classes
})

describe("findMany races", () => {
    it("Parses using schema", async () => {
        const mons = await api.races.findMany()

        expect(mons.length).toBeGreaterThan(0)
    })

    // TODO: use vitest mock and just check the url insated of the response
})
