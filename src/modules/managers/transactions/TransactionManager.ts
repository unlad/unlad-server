import { Server } from "modules/server/Server";

export class TransactionManager {
    server: Server

    async add(uuid: string, items: string, comment?: string) {
        const query = await this.server.database.transactions.add(uuid, items, comment)
        if (query.code) return { code: 1 } as const

        return { code: 0 }
    }

    async list(uuid: string) {
        const query = await this.server.database.transactions.list(uuid)
        if (query.code) return { code: 1 } as const

        return { code: 0, transactions: query.transactions } as const
    }

    async resolve(tid: string) {
        const query = await this.server.database.transactions.resolve(tid)
        if (query.code) return { code: 1 } as const

        return {
            code: 0,
            tid: query.data.tid,
            items: query.data.items,
            comment: query.data.comment, 
            timestamp: query.data.timestamp
        } as const
    }

    constructor(server: Server) {
        this.server = server
    }
}