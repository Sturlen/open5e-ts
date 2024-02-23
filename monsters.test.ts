import { expect, test, beforeAll, afterAll } from "vitest"
import Open5eAPI from "./src"
import fetchMock from "fetch-mock"

import aboleth from "./fixtures/aboleth.json"
import cc from "./fixtures/cc-limit-50.json"
import tob2andtob3 from "./fixtures/tob-and-tob3.json"
import findOne from "./fixtures/findOne.json"
import findTwenty from "./fixtures/find20.json"
import findFifty from "./fixtures/find50.json"

beforeAll(() => {
    fetchMock
        .get("https://api.open5e.com/monsters/aboleth", aboleth)
        .get(
            "https://api.open5e.com/monsters/?limit=50&document__slug__in=cc",
            cc
        )
        .get(
            "https://api.open5e.com/monsters/?limit=50&document__slug__in=tob2%2Ctob3",
            tob2andtob3
        )
        .get("https://api.open5e.com/monsters/?limit=1", findOne)
        .get("https://api.open5e.com/monsters/?limit=20", findTwenty)
        .get("https://api.open5e.com/monsters/?limit=50", findFifty)
        .mock()
        .catch({ status: 400 })
})

afterAll(() => {
    fetchMock.restore()
})

test("Find a monster by it's slug", async () => {
    const api = Open5eAPI()
    const mon = await api.monsters.findOne("aboleth")

    expect(mon.name).toBe("Aboleth")
})

test("Fetch many monsters", async () => {
    const api = Open5eAPI()
    const mons = await api.monsters.findMany()

    expect(mons.length).greaterThan(0)
})

test("Filter monsters by document slug", async () => {
    const api = Open5eAPI()
    const mons = await api.monsters.findMany({ document__slug: "cc" })

    expect(mons.length).toBeGreaterThan(0)
    for (const mon of mons) {
        expect(mon.document__slug).toBe("cc")
    }
})

test("Filter monsters by multiple document slugs", async () => {
    const api = Open5eAPI()
    const mons = await api.monsters.findMany({
        document__slug: ["tob2", "tob3"],
    })
    expect(mons.length).toBeGreaterThan(0)
    const number_of_monsters = mons.length
    const number_of_filtered_monsters = mons.filter(
        (mon) => mon.document__slug === "tob2" || mon.document__slug === "tob3"
    ).length

    // TODO: Find a better way to actually verify that both documents are included

    expect(number_of_monsters).toBe(number_of_filtered_monsters)
})

test("Return one monster when limit is one", async () => {
    const api = Open5eAPI()
    const mons = await api.monsters.findMany({ limit: 1 })

    expect(mons.length).toBe(1)
})

test("Return twenty monsters when limit is twenty", async () => {
    const api = Open5eAPI()
    const mons = await api.monsters.findMany({
        limit: 20,
    })

    expect(mons.length).toBe(20)
})
