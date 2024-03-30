Makes working with Open5e data in Typescript a breeze. All data is validated using Zod schemas, which gives high quality autocomplete your editor and full runtime safety. Usable on client and server.

Supports the following API endpoints:
- Monsters
- Spells
- Classes
- Magic Items
- Races

# Install

```sh
npm install @sturlen/open5e-ts
```

```sh
pnpm install @sturlen/open5e-ts
```

# Usage

```ts
import { Open5e } from "@sturlen/open5e-ts"

const api = new Open5e()

// Query up to 50 dragons from the Tome of Beasts books.
const dragons = await api.monsters.findMany({
    limit: 50,
    document__slug: ["tob", "tob2", "tob3"],
    search: "dragon",
})

// Use the result as you see fit
dragons.forEach((monster) => console.log("Challenge: " + monster.challenge_rating))


// Get a specific item by it's id/slug
const spell = await api.spells.get("cure-wounds")

console.log(spell.range) // Touch

// You can access the Zod schemas and use them separately
Ope5e.monsters.schema.parse(YourObject)

```

# References

[Open5e Site](https://open5e.com/)
[Open5e API](https://api.open5e.com/)
