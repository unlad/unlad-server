import { Database } from "modules/database/Database";

export class TransactionManager {
    database: Database

    async add(items: { uuid: string, name: string, price: number, amount: number }[], comment?: string) {
        const query = await this.database.transactions.add(items, comment)
        if (query.code) return { code: 1 } as const

        return { code: 0 }
    }

    async list(uuid: string) {
        const query = await this.database.transactions.list(uuid)
        if (query.code) return { code: 1 } as const

        return { code: 0, transactions: query.transactions } as const
    }

    async resolve(tid: string) {
        const query = await this.database.transactions.resolve(tid)
        if (query.code) return { code: 1 } as const

        return {
            code: 0,
            uuid: query.data.uuid,
            tid: query.data.tid,
            items: query.data.items,
            comment: query.data.comment, 
            timestamp: query.data.timestamp
        } as const
    }

    constructor(database: Database) {
        this.database = database
    }
}