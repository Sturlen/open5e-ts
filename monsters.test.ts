import { expect, it, beforeAll, afterAll, describe, afterEach } from "vitest"
import { Open5e } from "./src"
import fetchMock from "fetch-mock"
import fs from "fs"
import { Documents } from "./src/monsters"
import { exportMonsterToOpen5e, MonsterSchema } from "./src/schema/monster"

type APIResponse = {
    results: Array<Record<string, any> & { slug: string }>
}

const empty: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/empty.json", "utf-8"),
)
const monsters: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/monsters.json", "utf-8"),
)
const magic_items: APIResponse = JSON.parse(
    fs.readFileSync("./fixtures/magic_items.json", "utf-8"),
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

const ENDPOINT = "https://api.open5e.com"
const MONSTER_ENDPOINT = `${ENDPOINT}/monsters/`
const CLASS_ENDPOINT = `${ENDPOINT}/classes/`
const RACE_ENDPOINT = `${ENDPOINT}/races/`
const SPELL_ENDPOINT = `${ENDPOINT}/spells/`
const api = new Open5e()

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

describe("Get", () => {
    it("Gets an object by it's slug", async () => {
        fetchMock.once("*", monsters.results[0])
        await api.monsters.get("aboleth")

        expect(fetchMock.lastCall()?.[0]).toBe(`${MONSTER_ENDPOINT}aboleth`)
    })

    it("Return undefined if not found", async () => {
        fetchMock.once("*", {
            status: 404,
            body: "Not Found",
        })
        const mon = await api.monsters.get("not-a-monster")

        expect(mon).toBe(undefined)
    })

    it("Throws if slug is empty", async () => {
        expect(() => api.monsters.get("")).rejects.toThrow("Slug is required.")
    })

    it("Supports a custom api URL", () => {
        fetchMock.once("*", monsters.results[0])

        new Open5e("https://your.domain.com/").monsters.get("aboleth")

        expect(
            fetchMock.lastCall()?.[0].startsWith("https://your.domain.com/"),
        ).toBe(true)
    })
})

describe("findMany", () => {
    it("Fetches 50 objects by default", async () => {
        fetchMock.once("*", monsters)

        await api.monsters.findMany()

        expect(fetchMock.lastCall()?.[0]).toBe(`${MONSTER_ENDPOINT}?limit=50`)
    })

    it("Can filter by a document slug", async () => {
        fetchMock.once("*", monsters)
        await api.monsters.findMany({ document__slug: "cc" })

        expect(fetchMock.lastCall()?.[0]).toBe(
            `${MONSTER_ENDPOINT}?limit=50&document__slug__in=cc`,
        )
    })

    it("Can filter by multiple document slugs", async () => {
        fetchMock.once("*", monsters)
        await api.monsters.findMany({
            limit: 800,
            document__slug: [
                Documents["Tome of Beasts 2"],
                Documents["Tome of Beasts 3"],
            ],
        })

        expect(fetchMock.lastCall()?.[0]).toBe(
            `${MONSTER_ENDPOINT}?limit=800&document__slug__in=tob2%2Ctob3`,
        )
    })

    it("Can limit how many objects are returned", async () => {
        fetchMock.once("*", monsters)

        await api.monsters.findMany({ limit: 20 })

        expect(fetchMock.lastCall()?.[0]).toBe(`${MONSTER_ENDPOINT}?limit=20`)
    })

    it("Can choose which page is returned", async () => {
        fetchMock.once("*", monsters)

        await api.monsters.findMany({ page: 2 })

        expect(fetchMock.lastCall()?.[0]).toBe(
            `${MONSTER_ENDPOINT}?limit=50&page=2`,
        )
    })

    it("Can filter by a search string.", async () => {
        fetchMock.once("*", monsters)

        await api.monsters.findMany({ search: "dragon" })

        expect(
            fetchMock.called(`${MONSTER_ENDPOINT}?limit=50&search=dragon`),
        ).toBe(true)
    })

    it("Supports a custom API url", async () => {
        fetchMock.once("*", monsters)

        await api.monsters.findMany({ api_url: "https://my.api.com" })

        expect(fetchMock.lastCall()?.[0].startsWith("https://my.api.com")).toBe(
            true,
        )
    })

    it("Will throw if endpoint returns wrong data", async () => {
        fetchMock.once(`path:/spells/`, { results: [{ garbage: "rubbish" }] })

        expect(() => api.spells.findMany()).rejects.toThrow()
        expect(fetchMock.lastCall()?.[0]).toBe(`${SPELL_ENDPOINT}?limit=50`)
    })

    it("Returns an empty list if nothing matches", async () => {
        fetchMock.once("*", empty)

        const mons = await api.monsters.findMany({
            // @ts-expect-error
            document__slug: "not-a-document",
        })

        expect(fetchMock.lastCall()?.[0]).toBe(
            `${MONSTER_ENDPOINT}?limit=50&document__slug__in=not-a-document`,
        )
        expect(mons.length).toBe(0)
    })

    it("Each endpoint has a schema", () => {
        expect(api.classes.schema).toBeDefined()
        expect(api.monsters.schema).toBeDefined()
        expect(api.races.schema).toBeDefined()
        expect(api.spells.schema).toBeDefined()
    })
})

describe("Get", () => {
    it("Gets a class by it's slug", async () => {
        fetchMock.once("*", classes.results[0])

        await api.classes.get("barbarian")

        expect(fetchMock.called(`${CLASS_ENDPOINT}barbarian`)).toBe(true)
    })

    it("Return undefined if not found", async () => {
        fetchMock.once("*", {
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
        fetchMock.once("*", classes)

        const results = await api.classes.findMany()

        expect(results[0].prof_armor).toBe("Light armor, medium armor, shields")

        expect(results.length).toBeGreaterThan(0)
    })

    it("Magic Items", async () => {
        fetchMock.once("*", magic_items)

        const results = await api.magic_items.findMany()

        expect(results[0].rarity).toBe("rare")
        expect(results[0].requires_attunement).toBe(false)
        expect(results[2].requires_attunement).toBe(true)

        expect(results.length).toBeGreaterThan(0)
    })

    it("Monsters", async () => {
        fetchMock.once("*", monsters)

        const results = await api.monsters.findMany()

        expect(results[0].challenge_rating).toBe("10")
        expect(results[0].cr).toBe(10)
        expect(results[0].document.title).toBe("5e Core Rules")

        expect(results.length).toBeGreaterThan(0)
    })

    it("Races", async () => {
        fetchMock.once("*", races)

        const results = await api.races.findMany()

        expect(results[0].name).toBe("Dwarf")
        expect(results[0].size_raw).toBe("Medium")
        expect(results[0].subraces[0].name).toBe("Hill Dwarf")
        expect(results.length).toBeGreaterThan(0)
    })

    it("Spells", async () => {
        fetchMock.once("*", spells)

        const results = await api.spells.findMany()

        expect(results[6].name).toBe("Acid Arrow")
        expect(results[6].spell_level).toBe(2)
        expect(results[6].spell_lists).toStrictEqual(["wizard", "druid"])
        expect(results[6].components).toStrictEqual({
            V: true,
            S: true,
            M: true,
        })
        expect(results.length).toBeGreaterThan(0)
    })
})

describe("Spells", () => {
    it("Filter by only cantrips", async () => {
        fetchMock.once("*", spells)

        await api.spells.findMany({ spell_level: 0 })

        expect(fetchMock.lastCall()?.[0]).toBe(
            `${SPELL_ENDPOINT}?limit=50&level_int=0`,
        )
    })
})

describe("Monsters", () => {
    it("Can filter by challenge rating.", async () => {
        fetchMock.once("*", monsters)

        await api.monsters.findMany({
            challenge_rating: 1 / 8,
        })

        expect(fetchMock.lastCall()?.[0]).toBe(
            `${MONSTER_ENDPOINT}?limit=50&cr=0.125`,
        )
    })
})

describe("exportMonsterToOpen5e", () => {
    it("prouduces an object that can be parsed successfully by our schema.", async () => {
        fetchMock.once("*", monsters.results[0])

        const result = await api.monsters.get("dragon")
        if (!result) throw new Error("No result")

        MonsterSchema.parse(exportMonsterToOpen5e(result))
    })
})
