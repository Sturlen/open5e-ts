import {
    MonsterSchema,
    ClassSchema,
    endpoint,
    RaceSchema,
    monsterQuery,
} from "./monsters"

const DEFAULT_BASE_URL = "https://api.open5e.com"

function Open5eAPI(baseUrl = DEFAULT_BASE_URL) {
    return {
        monsters: endpoint(baseUrl, "/monsters/", MonsterSchema, monsterQuery),
        classes: endpoint(baseUrl, "/classes/", ClassSchema, monsterQuery),
        races: endpoint(baseUrl, "/races/", RaceSchema, monsterQuery),
    }
}

export default Open5eAPI
