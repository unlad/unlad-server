import { Server } from 'modules/server/Server'

export enum Rank {
    STUDENT = 0,
    ADMIN = 1
}

export class UserManager {
    server: Server

    async resolve(uuid: string) {
        const query = await this.server.database.users.resolve(uuid)
        if (query.code) return { code: 1 }

        return { 
            code: 0,
            uuid: query.data.uuid,
            id: query.data.id,
            username: query.data.username,
            handle: query.data.handle,
            rank: query.data.rank,
            created: query.data.created
        }
    }

    async create(uuid: string, id: string, username: string, hash: string) {
        const query = await this.server.database.users.create(uuid, id, username, hash)
        if (query.code) return { code: 1 }

        return { code: 0 }
    }

    async delete(uuid: string) {
        const query = await this.server.database.users.delete(uuid)
        if (query.code) return { code: 1 }

        return { code: 0 }
    }

    async hash(uuid: string) {
        const query = await this.server.database.users.hash(uuid)
        if (query.code) return { code: 1 }

        return { code: 0, hash: query.data.hash }
    }

    async uuid(username: string) {
        const query = await this.server.database.users.uuid(username)
        if (query.code) return { code: 1 }

        return { code: 0, uuid: query.data.uuid }
    }

    async rank(uuid: string, rank: Rank) {
        const query = await this.server.database.users.rank(uuid, rank)
        if (query.code) return { code: 1 }

        return { code: 0 }
    }

    constructor(server: Server) {
        this.server = server
    }
}