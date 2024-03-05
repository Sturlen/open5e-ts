Makes working with Open5e data in Typescript a breeze. All data is validated using Zod schemas, which gives you great autocomplete and runtime safety.

# Install

```sh
npm install @sturlen/open5e
```

```sh
pnpm install @sturlen/open5e
```

# Usage

```ts
import { Open5e } from "@sturlen/open5e"

// Query
const dragons = await Open5e.monsters.findMany({
    limit: 50,
    document__slug: "tob",
    search: "dragon",
})

// Use
dragons.forEach((monster) => console.log(monster.name))

// You can access the schemas and use them separately
Ope5e.monsters.schema.parse(YourObject)

```

# References

[Open5e Site](https://open5e.com/)
[Open5e API](https://api.open5e.com/)
