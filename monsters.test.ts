import { expect, it, beforeAll, afterAll, describe } from "vitest"
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

const MONSTER_PATH = "/monsters/"
const ENDPOINT = "https://api.example.com"
const MONSTER_ENDPOINT = `${ENDPOINT}${MONSTER_PATH}`
const api = Open5e(ENDPOINT)

beforeAll(() => {
    fetchMock.mock()
})

afterAll(() => {
    fetchMock.restore()
})

describe("Get", () => {
    it("Gets a monster by it's slug", async () => {
        fetchMock.once(
            `${MONSTER_ENDPOINT}aboleth`,
            monsters.results.find((m) => m.slug === "aboleth") ?? "",
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
        fetchMock.once(`${MONSTER_ENDPOINT}?limit=50`, {
            results: monsters.results.slice(0, 50),
        })

        const mons = await api.monsters.findMany()

        expect(mons.length).toBe(50)
    })

    it("If no monsters are found, return an empty list", async () => {
        fetchMock.once(
            `${MONSTER_ENDPOINT}?limit=50&document__slug__in=not-a-document`,
            empty,
        )
        const mons = await api.monsters.findMany({
            document__slug: "not-a-document",
        })

        expect(mons.length).toBe(0)
    })

    it("Can filter by a document slug", async () => {
        fetchMock.once(`${MONSTER_ENDPOINT}?limit=50&document__slug__in=cc`, {
            results: monsters.results.filter((m) => m.document__slug === "cc"),
        })
        const mons = await api.monsters.findMany({ document__slug: "cc" })

        expect(mons.length).toBeGreaterThan(0)
        for (const mon of mons) {
            expect(mon.document__slug).toBe("cc")
        }
    })

    it("Can filter by multiple document slugs", async () => {
        fetchMock.once(
            `${MONSTER_ENDPOINT}?limit=800&document__slug__in=tob2%2Ctob3`,
            {
                results: monsters.results.filter(
                    (m) =>
                        m.document__slug === "tob2" ||
                        m.document__slug === "tob3",
                ),
            },
        )
        const mons = await api.monsters.findMany({
            limit: 800,
            document__slug: ["tob2", "tob3"],
        })

        const number_of_monsters = mons.length
        const number_of_a_monsters = mons.filter(
            (mon) => mon.document__slug === "tob2",
        ).length
        const number_of_b_monsters = mons.filter(
            (mon) => mon.document__slug === "tob3",
        ).length

        expect(mons.length).toBeGreaterThan(0)
        expect(number_of_a_monsters).toBeGreaterThan(0)
        expect(number_of_b_monsters).toBeGreaterThan(0)
        expect(number_of_monsters).toBe(
            number_of_a_monsters + number_of_b_monsters,
        )
    })

    it("Can limit how many monsters are returned", async () => {
        fetchMock.once(`${MONSTER_ENDPOINT}?limit=1`, {
            results: monsters.results.slice(0, 1),
        })
        const one = await api.monsters.findMany({ limit: 1 })
        fetchMock.once(`${MONSTER_ENDPOINT}?limit=20`, {
            results: monsters.results.slice(0, 20),
        })
        const twenty = await api.monsters.findMany({ limit: 20 })

        expect(one.length).toBe(1)
        expect(twenty.length).toBe(20)
    })

    it("Can filter by a string. This can be in the name as well as other fields", async () => {
        fetchMock.once(`${MONSTER_ENDPOINT}?limit=50&search=dragon`, {
            results: monsters.results.filter(
                (m) =>
                    m.name.toLowerCase().includes("dragon") ||
                    m.desc.toLowerCase().includes("dragon"),
            ),
        })
        const mons = await api.monsters.findMany({ search: "dragon" })
        expect(mons.length).toBe(243)
    })

    it("Can filter by challenge rating.", async () => {
        fetchMock.once(`${MONSTER_ENDPOINT}?limit=50&cr=0.125`, {
            results: monsters.results.filter((m) => m.cr === 1 / 8),
        })
        const one_eight_cr = await api.monsters.findMany({
            challenge_rating: 1 / 8,
        })
        expect(one_eight_cr.length).toBe(57)
    })
})
