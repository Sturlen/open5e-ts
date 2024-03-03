Makes working with Open5e data a breeze. Typesafe and validated.

# Usage

```ts
const monsters = await api.monsters.findMany({limit: 50, document__slug: "tob"})

monster.map((monster) => monster.name)

```