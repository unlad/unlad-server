import { UserDatabase } from "modules/database/users/UserDatabase"
import { BankDatabase } from "modules/database/bank/BankDatabase"
import { TransactionDatabase } from "modules/database/transactions/TransactionDatabase";
import { ItemsDatabase } from "modules/database/items/ItemsDatabase";

import pg from "pg"

export class Database {
    pool: pg.Pool = new pg.Pool({
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,

        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
    })

    users = new UserDatabase(this)
    bank = new BankDatabase(this)
    transactions = new TransactionDatabase(this)
    items = new ItemsDatabase(this)

    async call<ReturnData extends Record<string, any>>(name: string, args: unknown[]) {
        const { rows, fields } = await this.pool.query({
            text: `SELECT "${name}"(${args.map((_, i) => `$${++i}`).join(',')})`,
            values: args
        })

        return rows[0][fields[0].name] as ReturnData;
    }

    async connect() {
        await this.pool.connect()
        console.log("Connected to database")
    }
}