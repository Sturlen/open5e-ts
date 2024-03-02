import { MonsterSchema, ClassSchema, endpoint, RaceSchema } from "./monsters"
import { z } from "zod"
const DEFAULT_BASE_URL = "https://api.open5e.com"

function Open5eAPI(baseUrl = DEFAULT_BASE_URL) {
    return {
        monsters: endpoint(baseUrl, "/monsters/", MonsterSchema),
        classes: endpoint(baseUrl, "/classes/", ClassSchema),
        races: endpoint(baseUrl, "/races/", RaceSchema),
    }
}

export default Open5eAPI
