import { Database } from "modules/database/Database"
import { Notifications } from "modules/database/entities/Notifications"
import { QueryResults } from "modules/database/QueryResults"

import { DataSource, Repository } from "typeorm"

export class NotificationsDatabase {
    database: Database
    source: DataSource
    repository: Repository<Notifications>

    async list() {
        return (this.repository.find()
            .then((tokens) => { return { code: 0, tokens } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Notifications.List>
    }

    async register(uuid: string, type: string, token: string ) {
        return (this.repository.insert({ uuid, type, token })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Notifications.Register>
    }

    async unregister(uuid: string, token: string) {
        return (this.repository.delete({ uuid, token })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Notifications.Unregister>
    }

    async resolve(uuid: string) {
        return (this.repository.findBy({ uuid })
            .then((tokens) => { return { code: 0, tokens } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Notifications.Resolve>
    }

    constructor(database: Database) {
        this.database = database
        this.source = database.source
        this.repository = this.source.getRepository(Notifications)
    }
}