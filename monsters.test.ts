import { expect, it, beforeAll, afterAll, describe, afterEach } from "vitest"
import { Open5e } from "./src"
import fetchMock from "fetch-mock"
import fs from "fs"

type APIResponse = {
    results: Array<Record<string, any> & { slug: string }>
}

const empty: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/empty.json", "utf-8"),
)
const monsters: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/monsters.json", "utf-8"),
)
const classes: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/classes.json", "utf-8"),
)
const races: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/races.json", "utf-8"),
)
const spells: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/spells.json", "utf-8"),
)

const ENDPOINT = "https://api.example.com"
const MONSTER_ENDPOINT = `${ENDPOINT}/monsters/`
const CLASS_ENDPOINT = `${ENDPOINT}/classes/`
const RACE_ENDPOINT = `${ENDPOINT}/races/`
const SPELL_ENDPOINT = `${ENDPOINT}/spells/`
const api = Open5e(ENDPOINT)

beforeAll(() => {
    fetchMock.mock()
})

afterAll(() => {
    fetchMock.restore()
})

afterEach(() => {
    fetchMock.reset()
    fetchMock.mock()
})

describe("The API object", () => {
    it("Can be created with a custom base URL", () => {
        fetchMock.once("*", monsters)

        Open5e("https://your.domain.com/").monsters.findMany()

        expect(fetchMock.called(`begin:https://your.domain.com/`)).toBe(true)
    })
})

describe("Get", () => {
    it("Gets an object by it's slug", async () => {
        fetchMock.once(
            `path:/monsters/aboleth`,
            // @ts-ignore
            monsters.results.find((m) => m.slug === "aboleth"),
        )
        const mon = await api.monsters.get("aboleth")

        expect(mon?.name).toBe("Aboleth")
    })

    it("Return undefined if not found", async () => {
        fetchMock.once(`${MONSTER_ENDPOINT}not-a-monster`, {
            status: 404,
            body: "Not Found",
        })
        const mon = await api.monsters.get("not-a-monster")

        expect(mon).toBe(undefined)
    })

    it("Throws if slug is empty", async () => {
        expect(() => api.monsters.get("")).rejects.toThrow("Slug is required.")
    })
})

describe("findMany", () => {
    it("Fetches 50 monsters by default", async () => {
        fetchMock.once(`path:/monsters/`, monsters)

        await api.monsters.findMany()

        expect(fetchMock.called(`${MONSTER_ENDPOINT}?limit=50`)).toBe(true)
    })

    it("Can filter by a document slug", async () => {
        fetchMock.once(`path:/monsters/`, monsters)
        await api.monsters.findMany({ document__slug: "cc" })

        expect(
            fetchMock.called(
                `${MONSTER_ENDPOINT}?limit=50&document__slug__in=cc`,
            ),
        ).toBe(true)
    })

    it("Can filter by multiple document slugs", async () => {
        fetchMock.once(`path:/monsters/`, monsters)
        await api.monsters.findMany({
            limit: 800,
            document__slug: ["tob2", "tob3"],
        })

        expect(
            fetchMock.called(
                `${MONSTER_ENDPOINT}?limit=800&document__slug__in=tob2%2Ctob3`,
            ),
        ).toBe(true)
    })

    it("Can limit how many monsters are returned", async () => {
        fetchMock.once(`path:/monsters/`, monsters)
        await api.monsters.findMany({ limit: 20 })

        expect(fetchMock.called(`${MONSTER_ENDPOINT}?limit=20`)).toBe(true)
    })

    it("Can filter by a string. This can be in the name as well as other fields", async () => {
        fetchMock.once(`path:/monsters/`, monsters)

        await api.monsters.findMany({ search: "dragon" })

        expect(
            fetchMock.called(`${MONSTER_ENDPOINT}?limit=50&search=dragon`),
        ).toBe(true)
    })

    it("Can filter by challenge rating.", async () => {
        fetchMock.once(`path:/monsters/`, monsters)

        await api.monsters.findMany({
            challenge_rating: 1 / 8,
        })

        expect(fetchMock.called(`${MONSTER_ENDPOINT}?limit=50&cr=0.125`)).toBe(
            true,
        )
    })
})

describe("Get", () => {
    it("Gets a class by it's slug", async () => {
        fetchMock.once(
            `path:/classes/barbarian`,
            // @ts-ignore
            classes.results.find((c) => c.slug === "barbarian"),
        )

        await api.classes.get("barbarian")

        expect(fetchMock.called(`${CLASS_ENDPOINT}barbarian`)).toBe(true)
    })

    it("Return undefined if not found", async () => {
        fetchMock.once(`${CLASS_ENDPOINT}not-a-class`, {
            status: 404,
            body: "Not Found",
        })
        const cls = await api.classes.get("not-a-class")

        expect(cls).toBe(undefined)
    })

    it("Throws if slug is empty", async () => {
        expect(() => api.classes.get("")).rejects.toThrow("Slug is required.")
    })
})

describe("Schema Validation", () => {
    it("Classes", async () => {
        fetchMock.once(`path:/classes/`, classes)
        const results = await api.classes.findMany()

        expect(results.length).toBeGreaterThan(0)
    })

    it("Monsters", async () => {
        fetchMock.once(`path:/monsters/`, monsters)
        const results = await api.monsters.findMany()

        expect(results.length).toBeGreaterThan(0)
    })

    it("Races", async () => {
        fetchMock.once(`path:/races/`, races)
        const results = await api.races.findMany()

        expect(results.length).toBeGreaterThan(0)
    })

    it("Spells", async () => {
        fetchMock.once(`path:/spells/`, spells)
        const results = await api.spells.findMany()

        expect(results.length).toBeGreaterThan(0)
    })

    it("Will throw if endpoint returns wrong data", async () => {
        fetchMock.once(`path:/spells/`, { results: [{ garbage: "rubbish" }] })
        expect(() => api.spells.findMany()).rejects.toThrow()
    })

    it("Returns an empty list if nothing matches", async () => {
        fetchMock.once(
            `${MONSTER_ENDPOINT}?limit=50&document__slug__in=not-a-document`,
            empty,
        )

        const mons = await api.monsters.findMany({
            document__slug: "not-a-document",
        })

        expect(mons.length).toBe(0)
    })
})

describe("Spells", () => {
    it("Filter by only cantrips", async () => {
        fetchMock.once(`path:/spells/`, spells)

        await api.spells.findMany({ spell_level: 0 })

        expect(fetchMock.called(`${SPELL_ENDPOINT}?limit=50&level_int=0`)).toBe(
            true,
        )
    })
})
