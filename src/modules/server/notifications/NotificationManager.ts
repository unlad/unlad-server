import { Database } from 'modules/database/Database'

import firebase from "firebase-admin"

export interface NotificationStartOptions {
    firebase: {
        account: firebase.ServiceAccount
    }
}

export interface Token {
    type: string,
    token: string
}

export type NotificationSendOptions = {
    type: "single",
    data: firebase.messaging.Message
} | {
    type: "multiple",
    data: firebase.messaging.Message[]
} | {
    type: "broadcast",
    data: firebase.messaging.MulticastMessage
}

export class NotificationManager {
    database: Database
    messaging: firebase.messaging.Messaging
    tokens: Map<string, Token[]> = new Map<string, Token[]>()

    async loadTokens() {
        const query = await this.database.notifications.list()
        if (query.code) return { code: 1 } as const
        
        this.tokens.clear()

        for (const { uuid, type, token } of query.tokens) {
            const existing = this.tokens.get(uuid)

            if (existing) {
                existing.push({ type, token })
                this.tokens.set(uuid, existing)
            } else {
                this.tokens.set(uuid, [{ type, token }])
            }
        }

        return { code: 0 } as const
    }

    async register(uuid: string, type: string, token: string) {
        const query = await this.database.notifications.register(uuid, type, token)
        if (query.code) return { code: 1 } as const

        const existing = this.tokens.get(uuid)

        if (existing) {
            existing.push({ type, token })
            this.tokens.set(uuid, existing)
        } else {
            this.tokens.set(uuid, [{ type, token }])
        }

        return { code: 0 } as const
    }

    async unregister(uuid: string, token: string) {
        const query = await this.database.notifications.unregister(uuid, token)
        if (query.code) return { code: 1 } as const

        const existing = this.tokens.get(uuid)
        
        if (existing) {
            const index = existing.findIndex(data => data.token == token)
            existing.splice(index, 1)

            this.tokens.set(uuid, existing)
        }

        return { code: 0 } as const
    }

    list() {
        return { code: 0, tokens: Array.from(this.tokens.entries()).map(data => { return { uuid: data[0], tokens: data[1] } } ) }
    }

    resolve(uuid: string) {
        const tokens = this.tokens.get(uuid)
        if (!tokens) return { code: 1 } as const

        return { code: 0, tokens } as const
    }

    async send(options: NotificationSendOptions) {
        let query

        switch(options.type) {
            case "single": query = this.messaging.send(options.data); break
            case "multiple": query = this.messaging.sendEach(options.data); break
            case "broadcast": query = this.messaging.sendEachForMulticast(options.data); break
        }

        query
            .then(() => { return { code: 0 } as const })
            .catch(() => { return { code: 1 } as const })
    }

    constructor(database: Database, options: NotificationStartOptions) {
        this.database = database

        firebase.initializeApp({ credential: firebase.credential.cert(options.firebase.account)})
        this.messaging = firebase.messaging()
    }
}