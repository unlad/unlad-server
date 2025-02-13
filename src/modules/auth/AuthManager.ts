import { Server } from 'modules/server/Server'
import { DatabaseManager } from 'modules/database/DatabaseManager'

import { hash, argon2id, verify } from 'argon2'
import session from "express-session"
import store from "connect-pg-simple"

export interface AccessToken {
    uuid: string
}

export interface RefreshToken {
    token: string
}

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

    // async authenticate(uuid: string, hash: string) {
    //     const authquery = await this.database.users.authenticate(uuid, hash)
    //     if (authquery.code) return { code: 1 }

    //     const userquery = await this.database.users.resolve(uuid)
    //     if (userquery.code) return { code: 2 }

    //     const access_data = this.public_key.encrypt(JSON.stringify({
    //         uuid: userquery.data.uuid,
    //         secret: userquery.data.secret
    //     }))

    //     const access = jwt.sign({ data: access_data }, this.keys.private, {
    //         algorithm: "RS512",
    //         expiresIn: Number(process.env.ACCESS_EXPIRY) * 24 * 60 * 60
    //     })

    //     const refresh_data = this.public_key.encrypt(JSON.stringify({
    //         uuid: userquery.data.uuid
    //     }))

    //     const refresh = jwt.sign({ data: refresh_data }, this.keys.private, {
    //         algorithm: "RS512",
    //         expiresIn: Number(process.env.REFRESH_EXPIRY) * 24 * 60 * 60
    //     })

    //     return {
    //         code: 0,
    //         access, refresh
    //     }
    // }

    // async refresh(access: string, refresh: string) {
    //     jwt.verify(refresh, this.keys.public, { algorithms: ["RS512"] }, (err) => {
    //         console.log(err)
    //     })

    //     const encrypted_refresh = jwt.verify(refresh, this.keys.public, { algorithms: ["RS512"], ignoreExpiration: true }) as JwtPayload
    //     if (encrypted_refresh.exp! > Date.now()) return { code: 1 }
    //     if (!encrypted_refresh.data) return { code: 2 }

    //     const refresh_data = JSON.parse(this.private_key.decrypt(encrypted_refresh.data))
    //     return encrypted_refresh
    // }

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