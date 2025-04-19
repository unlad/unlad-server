import { UserDatabase } from "modules/database/users/UserDatabase"
import { BankDatabase } from "modules/database/bank/BankDatabase"
import { TransactionDatabase } from "modules/database/transactions/TransactionDatabase";
import { ItemsDatabase } from "modules/database/items/ItemsDatabase";

import pg from "pg"

export type DatabaseStartOptions = {
    name: string
    user: string
    password: string
    host: string
    port: number
}

export class Database {
    _pool?: pg.Pool

    users = new UserDatabase(this)
    bank = new BankDatabase(this)
    transactions = new TransactionDatabase(this)
    items = new ItemsDatabase(this)

    async call<ReturnData extends Record<string, any>>(name: string, args: unknown[]) {
        const { rows, fields } = await this._pool!.query({
            text: `SELECT "${name}"(${args.map((_, i) => `$${++i}`).join(',')})`,
            values: args
        })

        return rows[0][fields[0].name] as ReturnData;
    }

    async connect(options: DatabaseStartOptions) {
        this._pool = new pg.Pool({
            database: options.name,
            user: options.user,
            password: options.password,
            host: options.host,
            port: options.port
        })
        
        await this._pool.connect()
        console.log("Connected to database")
    }
}