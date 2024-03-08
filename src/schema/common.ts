import { z } from "zod"

//** Properties shared by all Open5e content */
export const GameObject = z.object({
    slug: z.string(),
    name: z.string(),
    desc: z.string(),

    document__slug: z.string(),
    document__title: z.string(),
    document__license_url: z.string().nullish(),
    document__url: z.string(),
})

export type GameObject5e = z.output<typeof GameObject>
