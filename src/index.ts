import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { Server } from "modules/server/Server";

async function main(): Promise<void> {
    global.__filename = fileURLToPath(import.meta.url);
    global.__dirname = dirname(__filename);

    const server = new Server();

    const routedir = join(global.__dirname, "routes");
    await server.routing.register(routedir);

    server.start();
}

main();