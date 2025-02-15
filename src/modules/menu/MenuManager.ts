import { Server } from "modules/server/Server";
import { Item } from "modules/items/ItemManager"

export class MenuManager {
    server: Server

    items: Map<string, Item> = new Map<string, Item>()

    add(uuid: string) {
        const query = this.server.items.resolve(uuid)
        if (query.code) return { code: 1 }

        this.items.set(uuid, query.item)
    }

    remove(uuid: string) {
        const result = this.items.delete(uuid)
        if (!result) return { code: 0 }
        else return { code: 1 }
    }

    clear() {
        this.items.clear()

        return { code: 0 }
    }

    resolve() {
        return {
            code: 0,
            menu: Array.from(this.items.entries()).map(item => {
                return {
                    uuid: item[0],
                    name: item[1].name,
                    description: item[1].description,
                    price: item[1].price
                } as Item
            })
        }
    }

    constructor(server: Server) {
        this.server = server
    }
}