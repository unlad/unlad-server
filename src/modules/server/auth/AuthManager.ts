import { Server } from 'modules/server/Server'
import { Database } from 'modules/database/Database'

import { hash, argon2id, verify } from 'argon2'
import session from "express-session"
import store from "connect-pg-simple"
import { sign } from "cookie-signature";

export type AuthStartOptions = {
    secret: string,
    max_age: number
}

export class AuthManager {
    database: Database
    secret: string

    async getHash(data: string) {
        return await hash(data, {
            type: argon2id,
            hashLength: Number(process.env.HASH_BYTES) / 2,
            timeCost: Number(process.env.HASH_TIME),
            memoryCost: Number(process.env.HASH_MEMORY),
            parallelism: Number(process.env.HASH_THREADS),
        })
    }

    getSignature(ssid: string) {
        return sign(ssid, this.secret)
    }

    async verifyHash(plain: string, hash: string) {
        return await verify(hash, plain)
    }

    async authenticate(email: string, hash: string) {
        const hashquery = await this.database.users.hash(email)
        if (hashquery.code) return { code: 1 } as const

        const verified = await this.verifyHash(hash, hashquery.data.hash)
        if (!verified) return { code: 2 } as const

        const uuidquery = await this.database.users.uuid(email)
        if (uuidquery.code) return { code: 2 } as const

        return { code: 0, uuid: uuidquery.data.uuid } as const
    }

    constructor(database: Database, server: Server, options: AuthStartOptions) {
        this.database = database
        this.secret = options.secret

        server.app.use(session({
            store: new (store(session))({
                pool: this.database._pool,
                tableName: 'session'
            }),

            secret: options.secret,
            resave: false,
            cookie: { maxAge: options.max_age * 24 * 60 * 60 * 1000 }
        }))
    }
}