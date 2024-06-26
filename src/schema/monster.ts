import { z } from "zod"
import { GameObject } from "./common"

const SpeedSchema = z.object({
    walk: z.number().nullish(),
    swim: z.number().nullish(),
    fly: z.number().nullish(),
    burrow: z.number().nullish(),
    climb: z.number().nullish(),
    hover: z.boolean().nullish(),
})

const AbilitScores = {
    strength: z.number().positive(),
    dexterity: z.number().positive(),
    constitution: z.number().positive(),
    intelligence: z.number().positive(),
    wisdom: z.number().positive(),
    charisma: z.number().positive(),
}

const AbilitySaves = {
    strength_save: z.number().nullish(),
    dexterity_save: z.number().nullish(),
    constitution_save: z.number().nullish(),
    intelligence_save: z.number().nullish(),
    wisdom_save: z.number().nullish(),
    charisma_save: z.number().nullish(),
}

const Actions = z
    .array(
        z.object({
            name: z.string(),
            desc: z.string(),
            damage_dice: z.string().nullish(),
            attack_bonues: z.string().nullish(),
        }),
    )
    .nullish()
    .transform((val) => val ?? [])

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
    perception: z.number().nullish(),
    skills: z.record(z.number()),
    damage_vulnerabilities: z.string().nullish(),
    damage_resistances: z.string().nullish(),
    damage_immunities: z.string().nullish(),
    condition_immunities: z.string().nullish(),
    senses: z.string(),
    languages: z.string().nullish(),
    challenge_rating: z.string(),
    cr: z.number().nonnegative(),
    actions: Actions,
    reactions: Actions,
    legendary_desc: z.string(),
    legendary_actions: Actions,
    special_abilities: Actions,
    spell_list: z.array(z.string()),
    page_no: z.number().nullish(),

    img: z.string().optional(),
})
    .extend(AbilitScores)
    .extend(AbilitySaves)
    .transform(
        ({
            document__slug,
            document__title,
            document__url,
            document__license_url,
            ...rest
        }) => ({
            ...rest,
            document: {
                slug: document__slug,
                title: document__title,
                url: document__url,
                license: document__license_url,
            },
        }),
    )

/** This is the type returned by the Open5e API. */
export type RawMonster5e = z.input<typeof MonsterSchema>

/** Parsed Monster.
 * To export back to the Open5e format, use the function `exportMonsterToOpen5e`
 * @see exportMonsterToOpen5e
 */
export interface Monster5e extends z.output<typeof MonsterSchema> {}

export function exportMonsterToOpen5e({
    document,
    ...monster
}: Monster5e): Record<string, any> {
    return {
        ...monster,
        document__slug: document.slug,
        document__title: document.title,
        document__url: document.url,
        document__license_url: document.license,
    }
}
