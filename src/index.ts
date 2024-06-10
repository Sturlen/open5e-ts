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
    Class5e,
    Race5e,
    Spell5e,
    MagicItem5e,
} from "./monsters"
import {
    Monster5e,
    MonsterSchema,
    exportMonsterToOpen5e,
} from "./schema/monster"

export { type Monster5e, MonsterSchema, exportMonsterToOpen5e }

export const DEFAULT_OPEN5E_API_URL = "https://api.open5e.com"

export class Open5e {
    classes: Endpoint<Class5e, MonsterFindManyOptions>
    magic_items: Endpoint<MagicItem5e, MonsterFindManyOptions>
    monsters: Endpoint<Monster5e, MonsterFindManyOptions>
    races: Endpoint<Race5e, MonsterFindManyOptions>
    spells: Endpoint<Spell5e, SpellFindManyOptions>

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
