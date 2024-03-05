Makes working with Open5e data a breeze. Both Typesafe and fully validated.

# Usage

```ts
import { Open5e } from "@sturlen/open5e"

// Initialize
const api = Open5e()

// Query
const dragons = await api.monsters.findMany({limit: 50, document__slug: "tob", search: "dragon"})

// Use
dragons.forEach((monster) => console.log(monster.name))

```
