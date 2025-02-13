import { Server } from "modules/server/Server";
import { UserManager } from "modules/database/users/Users"
import { BankManager } from "modules/database/bank/BankManager"
import { TransactionManager } from "modules/database/transactions/TransactionManager";
import { ItemManager } from "modules/database/items/ItemManager";

import pg from "pg"

export class DatabaseManager {
    server: Server;
    pool: pg.Pool = new pg.Pool({
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,

        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
    })

    users = new UserManager(this)
    bank = new BankManager(this)
    transactions = new TransactionManager(this)
    items = new ItemManager(this)

    async call<ReturnData extends Record<string, any>>(name: string, args: unknown[]) {
        const { rows, fields } = await this.pool.query({
            text: `SELECT "${name}"(${args.map((v, i) => `$${++i}`).join(',')})`,
            values: args
        })

        return rows[0][fields[0].name] as ReturnData;
    }

    async connect() {
        await this.pool.connect()
        console.log("Connected to database")
    }

    constructor(server: Server) {
        this.server = server;
    }
}