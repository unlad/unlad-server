import { dirname } from "path";
import { fileURLToPath } from "url";

global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);

async function main(): Promise<void> {
    
}

main();