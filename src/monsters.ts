import { z } from "zod"

const SpeedSchema = z.object({
    walk: z.number().nullish(),
    swim: z.number().nullish(),
    fly: z.number().nullish(),
    burrow: z.number().nullish(),
    climb: z.number().nullish(),
    hover: z.boolean().nullish(),
})

export const MonsterSchema = z.object({
    slug: z.string(),
    name: z.string(),
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
                })
            )
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
                })
            )
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
                })
            )
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
                })
            )
        ),
    spell_list: z.array(z.string()),
    page_no: z.number().nullish(),
    document__license_url: z.string(),
    document__slug: z.string(),
    document__title: z.string(),
    document__url: z.string(),

    img: z.string().optional(),
})

const MonsterEndpointSchema = z.object({
    results: z.array(MonsterSchema),
})

export interface Monster extends z.infer<typeof MonsterSchema> {}

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

type MonsterFindManyOptions = {
    /** Limit query to one or more sources. By default all sources are used. */
    document__slug?: string | string[]
    /** Max number of items to fetch. */
    limit?: number
    /** Filter to items that contain the search string. */
    search?: string
}

const ResponseLimitSchema = z.number().int().min(1).max(5000).default(50)

type GenerateFetchUrl = (
    baseUrl: string | URL,
    options: MonsterFindManyOptions
) => URL

const generateFetchUrl: GenerateFetchUrl = (
    baseUrl,
    { document__slug, limit, search }
) => {
    const url = new URL(baseUrl)
    const params = url.searchParams

    params.append("limit", ResponseLimitSchema.parse(limit).toString())

    if (search) {
        params.append("search", search)
    }

    if (document__slug) {
        params.append(
            "document__slug__in",
            Array.isArray(document__slug)
                ? document__slug.join(",")
                : document__slug
        )
    }
    return url
}

const FETCH_OPTIONS: RequestInit = {
    headers: { Accept: "application/json", SDK: "@sturlen/Open5e" },
    redirect: "follow",
} as const

export function MonsterEndpoint(baseUrl: string) {
    return {
        findOne: async (slug: string): Promise<Monster> => {
            if (!slug) {
                throw new Error("Slug is required.")
            }
            const pathname = `/monsters/${slug}`
            const url = new URL(baseUrl)
            url.pathname = pathname
            const res = await fetch(url, FETCH_OPTIONS)

            if (!res.ok && res.status === 404) {
                throw new Error(`Monster with slug '${slug}' was not found.`)
            }
            if (!res.ok) {
                throw new Error(`Failed to fetch '${slug}' Code: ${res.status}`)
            }

            const res_json = await res.json()

            return MonsterSchema.parse(res_json)
        },
        findMany: async (
            options: MonsterFindManyOptions = {}
        ): Promise<Monster[]> => {
            const pathname = `/monsters/`
            const url = new URL(baseUrl)
            url.pathname = pathname
            const full_url = generateFetchUrl(url, options)

            const res = await fetch(full_url, FETCH_OPTIONS)
            const res_json = await res.json()
            return MonsterEndpointSchema.parse(res_json).results
        },
    }
}
