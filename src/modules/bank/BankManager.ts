import { Server } from "modules/server/Server";

export interface Item {
    uuid: string
    name: string
    description: string
    price: number
}

export class BankManager {
    server: Server

    items: Map<string, Item> = new Map<string, Item>()

    async resolve(uuid: string) {
        const query = await this.server.database.bank.resolve(uuid);
        if (query.code) return { code: 1 }

        return { code: 0, balance: query.data.balance }
    }

    async credit(uuid: string, amount: number) {
        const query = await this.server.database.bank.credit(uuid, amount)
        if (query.code) return { code: 1 }

        return { code: 0 }
    }
    
    async deduct(uuid: string, amount: number) {
        const query = await this.server.database.bank.deduct(uuid, amount)
        if (query.code) return { code: 1 }

        return { code: 0 }
    }

    async transfer(sender: string, receiver: string, amount: number) {
        const query = await this.server.database.bank.transfer(sender, receiver, amount)
        if (query.code) return { code: 1 }

        return { code: 0 }
    }

    constructor(server: Server) {
        this.server = server
    }
}