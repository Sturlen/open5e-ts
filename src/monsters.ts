import { z } from "zod"

export const GameObject = z.object({
    slug: z.string(),
    name: z.string(),
    desc: z.string(),

    document__slug: z.string(),
    document__title: z.string(),
    document__license_url: z.string().nullish(),
    document__url: z.string(),
})

const SpeedSchema = z.object({
    walk: z.number().nullish(),
    swim: z.number().nullish(),
    fly: z.number().nullish(),
    burrow: z.number().nullish(),
    climb: z.number().nullish(),
    hover: z.boolean().nullish(),
})

export const MonsterSchema = GameObject.extend({
    size: z.string(),
    type: z.string(),
    subtype: z.string().nullish(),
    group: z.string().nullish(),
    alignment: z.string(),
    armor_class: z.number(),
    armor_desc: z.string().nullish(),
    hit_points: z.number(),
    hit_dice: z.string(),
    speed: SpeedSchema,
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
    strength_save: z.number().nullish(),
    dexterity_save: z.number().nullish(),
    constitution_save: z.number().nullish(),
    intelligence_save: z.number().nullish(),
    wisdom_save: z.number().nullish(),
    charisma_save: z.number().nullish(),
    perception: z.number().nullish(),
    skills: z.record(z.number()),
    damage_vulnerabilities: z.string().nullish(),
    damage_resistances: z.string().nullish(),
    damage_immunities: z.string().nullish(),
    condition_immunities: z.string().nullish(),
    senses: z.string(),
    languages: z.string().nullish(),
    challenge_rating: z.string(),
    cr: z.number(),
    actions: z
        .string()
        .nullish()
        .or(
            z.array(
                z.object({
                    name: z.string(),
                    desc: z.string(),
                    damage_dice: z.string().nullish(),
                    attack_bonues: z.string().nullish(),
                }),
            ),
        )
        .transform((m) => (Array.isArray(m) ? m : [])),
    reactions: z
        .string()
        .nullish()
        .or(
            z.array(
                z.object({
                    name: z.string(),
                    desc: z.string(),
                    damage_dice: z.string().nullish(),
                    attack_bonues: z.string().nullish(),
                }),
            ),
        ),
    legendary_desc: z.string(),
    legendary_actions: z
        .string()
        .nullish()
        .or(
            z.array(
                z.object({
                    name: z.string(),
                    desc: z.string(),
                    damage_dice: z.string().nullish(),
                    attack_bonues: z.string().nullish(),
                }),
            ),
        ),
    special_abilities: z
        .string()
        .nullish()
        .or(
            z.array(
                z.object({
                    name: z.string(),
                    desc: z.string(),
                    damage_dice: z.string().nullish(),
                    attack_bonues: z.string().nullish(),
                }),
            ),
        ),
    spell_list: z.array(z.string()),
    page_no: z.number().nullish(),

    img: z.string().optional(),
})
export type Monster = z.infer<typeof MonsterSchema>

export const SubclassSchema = GameObject
export type Subclass = z.infer<typeof SubclassSchema>

export const ClassSchema = GameObject.extend({
    hit_dice: z.string(),
    hp_at_1st_level: z.string(),
    hp_at_higher_levels: z.string(),
    prof_armor: z.string(),
    prof_weapons: z.string(),
    prof_tools: z.string(),
    prof_saving_throws: z.string(),
    prof_skills: z.string(),
    equipment: z.string(),
    table: z.string(),
    spellcasting_ability: z.string(),
    subtypes_name: z.string(),
    archetypes: z.array(GameObject),
})
export type Class5e = z.infer<typeof ClassSchema>

export const SubraceSchema = GameObject.extend({
    asi: z.array(
        z.object({ attributes: z.array(z.string()), value: z.number() }),
    ),
    traits: z.string(),
    asi_desc: z.string(),
})
export type Subrace = z.infer<typeof SubraceSchema>

export const RaceSchema = GameObject.extend({
    asi_desc: z.string(),
    asi: z.array(
        z.object({ attributes: z.array(z.string()), value: z.number() }),
    ),
    age: z.string(),
    alignment: z.string(),
    size: z.string(),
    size_raw: z.string(),
    speed: z.object({ walk: z.number() }),
    speed_desc: z.string(),
    languages: z.string(),
    vision: z.string(),
    traits: z.string(),
    subraces: z.array(SubraceSchema),
})
export type Race = z.infer<typeof RaceSchema>

const document_slugs = [
    "o5e",
    "wotc-srd",
    "tob",
    "cc",
    "tob2",
    "dmag",
    "menagerie",
    "tob3",
    "a5e",
    "kp",
    "dmag-e",
    "warlock",
    "vom",
    "toh",
] as const

const DocumentNames = {
    Open5e: "o5e",
    "WotC SRD": "wotc-srd",
    "Tome of Beasts": "tob",
    "Creature Codex": "cc",
    "Tome of Beasts 2": "tob2",
    "Deep Magic": "dmag",
    "Warlock Magazine": "warlock",
} as const

type GameObjectOptions = {
    /** Limit query to one or more sources. By default all sources are used. */
    document__slug?: string | string[]
    /** Max number of items to fetch. */
    limit?: number
    /** Filter to items that contain the search string in the name or description. */
    search?: string
}

type MonsterFindManyOptions = GameObjectOptions & {
    /** Filter to items with a challenge rating equal to this value. Supports fractions e.g. `1/8` */
    challenge_rating?: number
} & {}

const ResponseLimitSchema = z.number().int().min(1).max(5000).default(50)

function buildQueryParams(
    params: Record<string, string | number | string[] | undefined>,
) {
    const url = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            url.append(key, value.join(","))
        } else if (value === undefined) {
        } else {
            url.append(key, value.toString())
        }
    }
    return url
}

type URLBuilder<O extends GameObjectOptions> = (
    base: URL,
    pathname: string,
    options: O | undefined,
) => URL

export const monsterQuery: URLBuilder<MonsterFindManyOptions> = (
    base,
    pathname,
    options = {},
) => {
    const url = new URL(base)
    url.pathname = pathname
    url.search = buildQueryParams({
        limit: ResponseLimitSchema.parse(options.limit),
        search: options.search,
        cr: options.challenge_rating,
        document__slug__in: options.document__slug,
    }).toString()

    return url
}

const FETCH_OPTIONS: RequestInit = {
    headers: {
        Accept: "application/json",
    },
    redirect: "follow",
} as const

export const EndpointResultSchema = z.object({
    results: z.array(z.object({}).passthrough()),
})

/** Common endpoint funcionality */
export function endpoint<T, Options extends GameObjectOptions>(
    baseUrl: string,
    pathname: string,
    schema: z.ZodType<T>,
    buildURL: URLBuilder<Options>,
) {
    return {
        get: async (slug: string): Promise<T | undefined> => {
            if (!slug) {
                throw new Error("Slug is required.")
            }
            const endpoint = `${pathname}${slug}`
            const url = new URL(baseUrl)
            url.pathname = endpoint
            const res = await fetch(url, FETCH_OPTIONS)

            if (!res.ok && res.status === 404) {
                return undefined
            }
            if (!res.ok) {
                throw new Error(`Failed to fetch '${slug}' Code: ${res.status}`)
            }

            const res_json = await res.json()

            return schema.parse(res_json)
        },
        findMany: async (options?: Options): Promise<T[]> => {
            const url = new URL(baseUrl)
            const full_url = buildURL(url, pathname, options)

            const res = await fetch(full_url, FETCH_OPTIONS)
            const res_json = await res.json()
            const results = EndpointResultSchema.parse(res_json).results

            return z.array(schema).parse(results)
        },
    }
}
