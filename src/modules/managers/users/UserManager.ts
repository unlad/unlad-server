import { Server } from 'modules/server/Server'

export enum Rank {
    STUDENT = 0,
    ADMIN = 1
}

export class UserManager {
    server: Server

    async resolve(uuid: string) {
        const query = await this.server.database.users.resolve(uuid)
        if (query.code) return { code: 1 } as const

        return { 
            code: 0,
            uuid: query.data.uuid,
            id: query.data.id,
            email: query.data.email,
            rank: query.data.rank,
            created: query.data.created
        } as const
    }

    async list() {
        const query = await this.server.database.users.list()
        if (query.code) return { code: 1 } as const

        return { code: 0, users: query.users } as const
    }

    async create(uuid: string, id: string, email: string, hash: string) {
        const query = await this.server.database.users.create(uuid, id, email, hash)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async delete(uuid: string) {
        const query = await this.server.database.users.delete(uuid)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    async hash(email: string) {
        const query = await this.server.database.users.hash(email)
        if (query.code) return { code: 1 } as const

        return { code: 0, hash: query.data.hash } as const
    }

    async uuid(email: string) {
        const query = await this.server.database.users.uuid(email)
        if (query.code) return { code: 1 } as const

        return { code: 0, uuid: query.data.uuid } as const
    }

    async rank(uuid: string, rank: Rank) {
        const query = await this.server.database.users.rank(uuid, rank)
        if (query.code) return { code: 1 } as const

        return { code: 0 } as const
    }

    constructor(server: Server) {
        this.server = server
    }
}