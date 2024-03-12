import {
    ClassSchema,
    MagicItemSchema,
    endpoint,
    RaceSchema,
    monsterQuery,
    SpellSchema,
    spellQuery,
    Endpoint,
    MonsterFindManyOptions,
    SpellFindManyOptions,
} from "./monsters"
import { MonsterSchema } from "./schema/monster"

export const DEFAULT_OPEN5E_API_URL = "https://api.open5e.com"

export class Open5e {
    classes: Endpoint<typeof ClassSchema, MonsterFindManyOptions>
    magic_items: Endpoint<typeof MagicItemSchema, MonsterFindManyOptions>
    monsters: Endpoint<typeof MonsterSchema, MonsterFindManyOptions>
    races: Endpoint<typeof RaceSchema, MonsterFindManyOptions>
    spells: Endpoint<typeof SpellSchema, SpellFindManyOptions>

    constructor(apiURL = DEFAULT_OPEN5E_API_URL) {
        this.classes = endpoint(apiURL, "/classes/", ClassSchema, monsterQuery)

        this.magic_items = endpoint(
            apiURL,
            "/magic-items/",
            MagicItemSchema,
            monsterQuery,
        )

        this.monsters = endpoint(
            apiURL,
            "/monsters/",
            MonsterSchema,
            monsterQuery,
        )

        this.races = endpoint(apiURL, "/races/", RaceSchema, monsterQuery)

        this.spells = endpoint(apiURL, "/spells/", SpellSchema, spellQuery)
    }
}
