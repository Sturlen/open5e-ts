import { expect, it, beforeAll, afterAll, describe } from "vitest"
import Open5eAPI from "./src"
import fetchMock from "fetch-mock"

import aboleth from "./fixtures/aboleth.json"
import cc from "./fixtures/cc-limit-50.json"
import tob2andtob3 from "./fixtures/tob-and-tob3.json"
import findOne from "./fixtures/findOne.json"
import findTwenty from "./fixtures/find20.json"
import findFifty from "./fixtures/find50.json"
import empty from "./fixtures/empty.json"

const MONSTER_PATH = "/monsters/"
const ENDPOINT = "https://api.example.com"
const MONSTER_ENDPOINT = `${ENDPOINT}${MONSTER_PATH}`

beforeAll(() => {
    fetchMock
        .get(`${MONSTER_ENDPOINT}aboleth`, aboleth)
        .get(`${MONSTER_ENDPOINT}not-a-monster`, {
            status: 404,
            body: "Not Found",
        })
        .get(
            `${MONSTER_ENDPOINT}?limit=50&document__slug__in=not-a-document`,
            empty
        )
        .get(`${MONSTER_ENDPOINT}?limit=50&document__slug__in=cc`, cc)
        .get(
            `${MONSTER_ENDPOINT}?limit=800&document__slug__in=tob2%2Ctob3`,
            tob2andtob3
        )
        .get(`${MONSTER_ENDPOINT}?limit=1`, findOne)
        .get(`${MONSTER_ENDPOINT}?limit=20`, findTwenty)
        .get(`${MONSTER_ENDPOINT}?limit=50`, findFifty)
        .mock()
        .catch({ status: 400 })
})

afterAll(() => {
    fetchMock.restore()
})

describe("findOne", () => {
    it("Gets a monster by it's slug", async () => {
        const api = Open5eAPI(ENDPOINT)
        const mon = await api.monsters.findOne("aboleth")

        expect(mon.name).toBe("Aboleth")
    })

    it("Throws if a monster is not found", async () => {
        const api = Open5eAPI(ENDPOINT)
        expect(() => api.monsters.findOne("not-a-monster")).rejects.toThrow(
            "Monster with slug 'not-a-monster' was not found."
        )
    })
})

describe("findMany", () => {
    it("Fetches 50 monsters by default", async () => {
        const api = Open5eAPI(ENDPOINT)
        const mons = await api.monsters.findMany()

        expect(mons.length).toBe(50)
    })

    it("If no monsters are found, return an empty list", async () => {
        const api = Open5eAPI(ENDPOINT)
        const mons = await api.monsters.findMany({
            document__slug: "not-a-document",
        })

        expect(mons.length).toBe(0)
    })

    it("Can filter by a document slug", async () => {
        const api = Open5eAPI(ENDPOINT)
        const mons = await api.monsters.findMany({ document__slug: "cc" })

        expect(mons.length).toBeGreaterThan(0)
        for (const mon of mons) {
            expect(mon.document__slug).toBe("cc")
        }
    })

    it("Can filter by multiple document slugs", async () => {
        const api = Open5eAPI(ENDPOINT)
        const mons = await api.monsters.findMany({
            limit: 800,
            document__slug: ["tob2", "tob3"],
        })
        expect(mons.length).toBeGreaterThan(0)
        const number_of_monsters = mons.length
        const number_of_a_monsters = mons.filter(
            (mon) => mon.document__slug === "tob2"
        ).length
        const number_of_b_monsters = mons.filter(
            (mon) => mon.document__slug === "tob3"
        ).length

        expect(number_of_a_monsters).toBeGreaterThan(0)
        expect(number_of_b_monsters).toBeGreaterThan(0)

        expect(number_of_monsters).toBe(
            number_of_a_monsters + number_of_b_monsters
        )
    })

    it("Can limit how many monsters are returned", async () => {
        const api = Open5eAPI(ENDPOINT)
        const one = await api.monsters.findMany({ limit: 1 })
        const twenty = await api.monsters.findMany({ limit: 20 })

        expect(one.length).toBe(1)
        expect(twenty.length).toBe(20)
    })
})
