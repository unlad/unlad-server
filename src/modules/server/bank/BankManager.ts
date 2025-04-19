import { Database } from "modules/database/Database";

export interface Item {
    uuid: string
    name: string
    description: string
    price: number
}

export class BankManager {
    database: Database

    items: Map<string, Item> = new Map<string, Item>()

    async resolve(uuid: string) {
        const query = await this.database.bank.resolve(uuid);
        if (query.code) return { code: 1 } as const

        return { code: 0, balance: query.data.balance } as const
    }

    async credit(uuid: string, amount: number) {
        const query = await this.database.bank.credit(uuid, amount)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }
    
    async deduct(uuid: string, amount: number) {
        const query = await this.database.bank.deduct(uuid, amount)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async transfer(sender: string, receiver: string, amount: number) {
        const query = await this.database.bank.transfer(sender, receiver, amount)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    constructor(database: Database) {
        this.database = database
    }
}