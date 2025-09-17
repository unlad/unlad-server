import { Database } from 'modules/database/Database'

export interface Token {
    type: string,
    token: string
}

export class PropertyManager {
    database: Database

    async register(uuid: string, name: string, description: string) {
        const query = await this.database.properties.register(uuid, name, description)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async unregister(uuid: string, property: string) {
        const query = await this.database.properties.unregister(uuid, property)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async update(uuid: string, property: string, status: number, recovery?: { uuid: string, surrendered: boolean, message?: string, timestamp: number } | false) {
        const query = await this.database.properties.update(uuid, property, status, recovery)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async list(uuid: string) {
        const query = await this.database.properties.list(uuid)
        if (query.code) return { code: 1 } as const

        return { code: 0, properties: query.properties } as const
    }

    async resolve(property: string) {
        const query = await this.database.properties.resolve(property)
        if (query.code) return { code: 1 } as const

        return { code: 0, data: query.data } as const
    }

    constructor(database: Database) {
        this.database = database
    }
}