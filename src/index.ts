import { MonsterEndpoint, ClassEndpoint } from "./monsters"

const DEFAULT_BASE_URL = "https://api.open5e.com"

function Open5eAPI(baseUrl = DEFAULT_BASE_URL) {
    const monsters = MonsterEndpoint(baseUrl)
    const classes = ClassEndpoint(baseUrl)

    return { monsters, classes }
}

export default Open5eAPI
