import { dirname } from "path";
import { fileURLToPath } from "url";

import { Server } from "modules/server/Server";
import { readFileSync } from "fs";
import { RoutingManager } from "modules/routing/RoutingManager";

global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);

const key = readFileSync("mock/secrets/ssl/server.key")
const cert = readFileSync("mock/secrets/ssl/server.crt")

async function main(): Promise<void> {
    const server = new Server()
    server.start();

    const routing = new RoutingManager()
    await routing.register(server)
}

main();