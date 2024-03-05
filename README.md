Makes working with Open5e data a breeze. Typesafe and validated.

# Usage

```ts
import { Open5e } from "@sturlen/open5e"

// Initialize
const api = Open5e()

// Query
const monsters = await api.monsters.findMany({limit: 50, document__slug: "tob", search: "dragon"})

// Use
monster.map((monster) => YourCodeHere(monster))

```
