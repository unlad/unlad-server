import { Server } from "modules/server/Server";
import { UsersDatabase } from "modules/database/users/UsersDatabase"
import { BankDatabase } from "modules/database/bank/BankDatabase"
import { TransactionsDatabase } from "modules/database/transactions/TransactionsDatabase";
import { ItemsDatabase } from "modules/database/items/ItemsDatabase";

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

    users = new UsersDatabase(this)
    bank = new BankDatabase(this)
    transactions = new TransactionsDatabase(this)
    items = new ItemsDatabase(this)

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