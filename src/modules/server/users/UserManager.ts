import { Database } from 'modules/database/Database'

export enum Rank {
    STUDENT = 0,
    ADMIN = 1
}

export class UserManager {
    database: Database

    async resolve(uuid: string) {
        const query = await this.database.users.resolve(uuid)
        if (query.code) return { code: 1 } as const

        return { 
            code: 0,
            uuid: query.data.uuid,
            id: query.data.id,
            name: query.data.name,
            email: query.data.email,
            rank: query.data.rank,
            created: query.data.created
        } as const
    }

    async list() {
        const query = await this.database.users.list()
        if (query.code) return { code: 1 } as const

        return { code: 0, users: query.users } as const
    }

    async create(uuid: string, id: string, name: string, email: string, hash: string) {
        const query = await this.database.users.create(uuid, id, name, email, hash)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async delete(uuid: string) {
        const query = await this.database.users.delete(uuid)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async hash(email: string) {
        const query = await this.database.users.hash(email)
        if (query.code) return { code: 1 } as const

        return { code: 0, hash: query.data.hash } as const
    }

    async uuid(email: string) {
        const query = await this.database.users.uuid(email)
        if (query.code) return { code: 1 } as const

        return { code: 0, uuid: query.data.uuid } as const
    }

    async rank(uuid: string, rank: Rank) {
        const query = await this.database.users.rank(uuid, rank)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    constructor(database: Database) {
        this.database = database
    }
}