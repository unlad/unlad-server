import { Server } from 'modules/server/Server'
import { DatabaseManager } from 'modules/database/DatabaseManager'

import { hash, argon2id, verify } from 'argon2'
import session from "express-session"
import store from "connect-pg-simple"

export class AuthManager {
    database: DatabaseManager

    async getHash(data: string) {
        return await hash(data, {
            type: argon2id,
            hashLength: Number(process.env.HASH_BYTES) / 2,
            timeCost: Number(process.env.HASH_TIME),
            memoryCost: Number(process.env.HASH_MEMORY),
            parallelism: Number(process.env.HASH_THREADS),
        })
    }

    async verifyHash(hash: string, data: string) {
        return verify(hash, data)
    }

    async authenticate(username: string, hash: string) {
        const hashquery = await this.database.users.hash(username)
        if (hashquery.code) return { code: 1 } as const

        if (!this.verifyHash(hashquery.data.hash, hash)) return { code: 2 } as const

        const uuidquery = await this.database.users.uuid(username)
        if (uuidquery.code) return { code: 2 } as const

        return { code: 0, uuid: uuidquery.data.uuid } as const
    }

    constructor(server: Server) {
        this.database = server.database
        
        server.app.use(session({
            store: new (store(session))({
                pool: this.database.pool,
                tableName: 'session'
            }),

            secret: this.database.server.secrets.session.toString(),
            resave: false,
            cookie: {
                maxAge: Number(process.env.MAX_AGE) * 24 * 60 * 60 * 1000
            }
        }))
    }
}