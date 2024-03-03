import {
    MonsterSchema,
    ClassSchema,
    endpoint,
    RaceSchema,
    monsterQuery,
    SpellSchema,
    spellQuery,
} from "./monsters"

const DEFAULT_BASE_URL = "https://api.open5e.com"

export function Open5e(baseUrl = DEFAULT_BASE_URL) {
    return {
        monsters: endpoint(baseUrl, "/monsters/", MonsterSchema, monsterQuery),
        classes: endpoint(baseUrl, "/classes/", ClassSchema, monsterQuery),
        races: endpoint(baseUrl, "/races/", RaceSchema, monsterQuery),
        spells: endpoint(baseUrl, "/spells/", SpellSchema, spellQuery),
    }
}

export default Open5e
