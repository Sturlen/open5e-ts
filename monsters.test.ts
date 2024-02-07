import { expect, test } from "vitest"
import Open5eAPI from "./src"

// TODO: Test againtst a mock, instead of the real API

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
    for (const mon of mons) {
        expect(mon.document__slug).toBe("cc")
    }
})
