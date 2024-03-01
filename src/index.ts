import { MonsterSchema, ClassSchema, endpoint } from "./monsters"

const DEFAULT_BASE_URL = "https://api.open5e.com"

function Open5eAPI(baseUrl = DEFAULT_BASE_URL) {
    return {
        monsters: endpoint(baseUrl, "/monsters/", MonsterSchema),
        classes: endpoint(baseUrl, "/classes/", ClassSchema),
    }
}

export default Open5eAPI
