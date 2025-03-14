import { dirname } from "path";
import { fileURLToPath } from "url";

import { Server } from "modules/server/Server";
import { readFileSync } from "fs";

global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);

const key = readFileSync("mock/ssl/mock.key")
const cert = readFileSync("mock/ssl/mock.crt")

async function main(): Promise<void> {
    
}

main();