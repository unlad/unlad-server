import { Database } from "modules/database/Database";

export interface Item {
    uuid: string
    name: string
    type: string
    description: string
    price: number,
    stock: number
}

export class ItemManager {
    database: Database

    items: Map<string, Item> = new Map<string, Item>()

    async loadItems() {
        const query = await this.database.items.list()
        if (query.code) return { code: 1 } as const

        this.items.clear()

        for (const item of query.items) {
            this.items.set(item.uuid, item as Item)
        }

        return { code: 0 } as const
    }

    list() {
        return { code: 0, items: Array.from(this.items.values()) } as const
    }

    resolve(uuid: string) {
        const item = this.items.get(uuid)
        if (!item) return { code: 1 } as const

        return { code: 0, item } as const
    }

    async add(name: string, type: string, description: string, price: number) {
        const query = await this.database.items.create(name, type, description, price)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    async rename(uuid: string, name: string) {
        const query = await this.database.items.rename(uuid, name)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    async retype(uuid: string, type: string) {
        const query = await this.database.items.retype(uuid, type)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    async redescribe(uuid: string, description: string) {
        const query = await this.database.items.redescribe(uuid, description)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    async reprice(uuid: string, price: number) {
        const query = await this.database.items.reprice(uuid, price)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    async restock(uuid: string, stock: number) {
        const query = await this.database.items.restock(uuid, stock)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    async delete(uuid: string) {
        const query = await this.database.items.delete(uuid)
        if (query.code) return { code: 1 } as const

        const reload = await this.loadItems()
        if (reload.code) return { code: 2 } as const

        return { code: 0 } as const
    }

    constructor(database: Database) {
        this.database = database

        this.loadItems()
    }
}