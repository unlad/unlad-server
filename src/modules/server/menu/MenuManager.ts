import { Item, ItemManager } from "modules/server/items/ItemManager"

export class MenuManager {
    manager: ItemManager

    items: Map<string, Item> = new Map<string, Item>()

    add(uuid: string) {
        const query = this.manager.resolve(uuid)
        if (query.code) return { code: 1 } as const

        this.items.set(uuid, query.item)

        return { code: 0 } as const
    }

    remove(uuid: string) {
        const result = this.items.delete(uuid)
        if (!result) return { code: 1 } as const
        
        return { code: 0 } as const
    }

    clear() {
        this.items.clear()

        return { code: 0 } as const
    }

    resolve() {
        return {
            code: 0,
            menu: Array.from(this.items.values())
        } as const
    }

    constructor(manager: ItemManager) {
        this.manager = manager
    }
}