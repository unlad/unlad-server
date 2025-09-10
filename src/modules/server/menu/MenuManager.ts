import { Item, ItemManager } from "modules/server/items/ItemManager"

export class MenuManager {
    manager: ItemManager

    items: string[] = []

    add(uuid: string) {
        if (this.items.includes(uuid)) return { code: 1 } as const 

        const query = this.manager.resolve(uuid)
        if (query.code) return { code: 2 } as const

        this.items.push(uuid)

        return { code: 0 } as const
    }

    remove(uuid: string) {
        const index = this.items.findIndex(id => id == uuid)
        if (index == -1) return { code: 1 } as const

        this.items.splice(index, 1)
        
        return { code: 0 } as const
    }

    clear() {
        this.items.splice(0)

        return { code: 0 } as const
    }

    resolve() {
        const menu = this.items.map(uuid => {
            const query = this.manager.resolve(uuid)
            if (query.code) return null

            return query.item
        })

        if (menu.includes(null)) return { code: 1 }

        return { code: 0, menu } as const
    }

    constructor(manager: ItemManager) {
        this.manager = manager
    }
}