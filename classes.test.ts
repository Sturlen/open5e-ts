import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { Open5e } from "./src"
import fetchMock from "fetch-mock"
import fs from "fs"

const classes = JSON.parse(fs.readFileSync("./fixtures/classes.json", "utf-8"))
const races = JSON.parse(fs.readFileSync("./fixtures/races.json", "utf-8"))
const spells = JSON.parse(fs.readFileSync("./fixtures/spells.json", "utf-8"))
const monsters = JSON.parse(
    fs.readFileSync("./fixtures/monsters.json", "utf-8"),
)

const MONSTER_PATH = "/classes/"
const HOST = "https://api.example.com"
const ENDPOINT = `${HOST}${MONSTER_PATH}`
const api = Open5e(HOST)

beforeAll(() => {
    fetchMock
        .get(
            `${ENDPOINT}barbarian`,
            classes.results.find((c: any) => c.slug === "barbarian"),
        )
        .get(`${ENDPOINT}not-a-class`, {
            status: 404,
            body: "Not Found",
        })
        .get(`${ENDPOINT}?limit=50`, classes)
        .get(`${HOST}/races/?limit=50`, races)
        .get(`${HOST}/spells/?limit=5000`, {
            results: spells.results,
        })
        .get(`${HOST}/monsters/?limit=5000`, {
            results: monsters.results,
        })
        .get(`${HOST}/spells/?limit=50&level_int=0`, {
            results: spells.results
                .filter((s: any) => s.level_int === 0)
                .slice(0, 50),
        })
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

describe("Schema Validation", () => {
    it("Classes", async () => {
        const results = await api.classes.findMany()

        expect(results.length).toBeGreaterThan(0)
    })

    it("Monsters", async () => {
        const results = await api.monsters.findMany({ limit: 5000 })

        expect(results.length).toBeGreaterThan(0)
    })

    it("Races", async () => {
        const results = await api.races.findMany()

        expect(results.length).toBeGreaterThan(0)
    })

    it("Spells", async () => {
        const results = await api.spells.findMany({ limit: 5000 })

        expect(results.length).toBeGreaterThan(0)
    })
})

describe("Spells", () => {
    it("Filter by only cantrips", async () => {
        const results = await api.spells.findMany({ spell_level: 0 })

        const filtered = results.filter((s) => s.level_int === 0)

        expect(results.length).toBeGreaterThan(0)
        expect(results.length).toBe(filtered.length)
    })
})
