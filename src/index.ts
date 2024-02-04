import { MonsterEndpoint } from "./monsters"

console.log("Hello, world!")

function Open5eAPI() {
    const monsters = MonsterEndpoint()

    return { monsters }
}

export default Open5eAPI
