import pg from "pg"
import { DataSource } from "typeorm"

import source from "modules/database/Source"

export type DatabaseStartOptions = {
    name: string
    user: string
    password: string
    host: string
    port: number
}

export class Database {
    pool?: pg.Pool
    source: DataSource

    async connect(options: DatabaseStartOptions) {
        this.pool = new pg.Pool({
            database: options.name,
            user: options.user,
            password: options.password,
            host: options.host,
            port: options.port
        })
        
        await this.pool.connect()
        console.log("Connected to database")
    }

    constructor() {
        this.source = source
    }
}