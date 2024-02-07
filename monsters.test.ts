import { expect, test } from "vitest"
import Open5eAPI from "./src"

test("Find a monster by it's slug", async () => {
    const api = Open5eAPI()
    const mon = await api.monsters.findOne("aboleth")

    expect(mon.name).toBe("Aboleth")
})
