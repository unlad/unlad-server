import { dirname } from "path";
import { fileURLToPath } from "url";

import { Server } from "modules/server/Server";
import { readFileSync } from "fs";
import { Routing } from "modules/routing/Routing";

global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);

const key = readFileSync("mock/secrets/ssl/server.key")
const cert = readFileSync("mock/secrets/ssl/server.crt")

async function main(): Promise<void> {
    const server = new Server()
    server.start();

    const routing = new Routing()
    await routing.register(server)
}

main();