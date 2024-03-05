import {
    MonsterSchema,
    ClassSchema,
    endpoint,
    RaceSchema,
    monsterQuery,
    SpellSchema,
    spellQuery,
} from "./monsters"

export const DEFAULT_OPEN5E_API_URL = "https://api.open5e.com"

const classes = endpoint(
    DEFAULT_OPEN5E_API_URL,
    "/classes/",
    ClassSchema,
    monsterQuery,
)

const monsters = endpoint(
    DEFAULT_OPEN5E_API_URL,
    "/monsters/",
    MonsterSchema,
    monsterQuery,
)

const races = endpoint(
    DEFAULT_OPEN5E_API_URL,
    "/races/",
    RaceSchema,
    monsterQuery,
)

const spells = endpoint(
    DEFAULT_OPEN5E_API_URL,
    "/spells/",
    SpellSchema,
    spellQuery,
)

export const Open5e = { classes, monsters, spells, races }
