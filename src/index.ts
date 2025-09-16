import "reflect-metadata"
import { dirname } from "path";
import { fileURLToPath } from "url";

import { Secrets } from "modules/secrets/Secrets";
import { Server } from "modules/server/Server";
import { Database } from "modules/database/Database";
import { Routing } from "modules/routing/Routing";
import { Config } from "modules/config/Config";

global.__filename = fileURLToPath(import.meta.url);
global.__dirname = dirname(__filename);

async function main(): Promise<void> {
    const config = new Config()

    const secrets = new Secrets()
    secrets.generate({ 
        source: "secrets",
        commonname: config.web.uris[0],
        altnames: {
            ips: config.web.ips,
            uris: config.web.uris
        },
        generate: ["session", "ssl"]
    })
    secrets.load({ source: "secrets", ssl: true });
    
    const database = new Database()
    await database.connect(config.database)

    const server = new Server(database, {
        firebase: {
            account: secrets.firebase!.account
        },
        auth: {
            secret: secrets.session!.secret.toString(),
            max_age: config.auth.max_age
        }
    })
    
    const routing = new Routing()
    await routing.register(server)
    
    server.start({ ssl: config.environment == "PROD" && secrets.ssl, port: config.web.port })
    process.on("exit", () => server.stop())
}

main();