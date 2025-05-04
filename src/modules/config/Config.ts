import "dotenv";
import { config } from "dotenv";

export class Config {
    environment: "PROD" | string;

    web: {
        port: number,
        ips: string[],
        uris: string[],
    };

    database: {
        name: string,
        user: string,
        password: string,
        host: string,
        port: number
    };

    auth: {
        max_age: number
    };

    argon2: {
        bytes: number,
        time: number,
        memory: number,
        threads: number
    }

    constructor(path?: string) {
        path ? config({ path}) : config()

        this.environment = process.env.ENV as "TEST" | "PROD" ?? "TEST"
        
        this.web = {
            port: Number(process.env.WEB_PORT) ?? 443,
            ips: process.env.WEB_IPS?.split(";").map(ip => ip.trim()) ?? [],
            uris: process.env.WEB_URIS?.split(";").map(uri => uri.trim()) ?? []
        }

        this.database = {
            name: process.env.DB_NAME ?? "data",
            user: process.env.DB_USER ?? "postgres",
            password: process.env.DB_PASSWORD ?? "postgres",
            host: process.env.DB_HOST ?? "172.17.0.1",
            port: Number(process.env.DB_PORT) ?? 5432,
        }

        this.auth = {
            max_age: Number(process.env.MAX_AGE) ?? 3
        }

        this.argon2 = {
            bytes: Number(process.env.HASH_BYTES) ?? 64,
            time: Number(process.env.HASH_TIME) ?? 3,
            memory: Number(process.env.HASH_MEMORY) ?? 65536,
            threads: Number(process.env.HASH_THREADS) ?? 4,
        }
    }
}