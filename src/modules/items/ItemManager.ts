import { Server } from "modules/server/Server";

import { v4 } from "uuid";

export interface Item {
    uuid: string
    name: string
    description: string
    price: number
}

export class ItemManager {
    server: Server

    items: Map<string, Item> = new Map<string, Item>()

    async loadItems() {
        const query = await this.server.database.items.list()
        if (query.code) return { code: 1 }

        for (const item of query.items) {
            this.items.set(item.uuid, item as Item)
        }

        return { code: 0 }
    }

    list() {
        return { code: 0, items: Array.from(this.items.values()) } as const
    }

    resolve(uuid: string) {
        const item = this.items.get(uuid)
        if (!item) return { code: 1 } as const

        return { code: 0, item } as const
    }

    async add(name: string, description: string, price: number) {
        const uuid = v4()

        const query = await this.server.database.items.create(uuid, name, description, price)
        if (query.code) return { code: 1 }

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 }

        return { code: 0 }
    }

    async delete(uuid: string) {
        const query = await this.server.database.items.delete(uuid)
        if (query.code) return { code: 1 }

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 }

        return { code: 0 }
    }

    constructor(server: Server) {
        this.server = server

        this.loadItems()
    }
}