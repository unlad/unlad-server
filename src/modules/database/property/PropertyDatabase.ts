import { Database } from "modules/database/Database"
import { Property } from "modules/database/entities/Property"
import { QueryResults } from "modules/database/QueryResults"

import { DataSource, Repository } from "typeorm"

export class PropertyDatabase {
    database: Database
    source: DataSource
    repository: Repository<Property>

    async list(uuid: string) {
        return (this.repository.findBy({ uuid })
            .then((properties) => { return { code: 0, properties } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Property.List>
    }

    async register(uuid: string, name: string, description: string) {
        return (this.repository.insert({ uuid, name, description })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Property.Register>
    }

    async unregister(uuid: string, property: string) {
        return (this.repository.delete({ uuid, property })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Property.Unregister>
    }

    async update(uuid: string, property: string, status: number, recovery?: { uuid: string, surrendered: boolean, message?: string, timestamp: number }) {
        return (this.repository.update({ uuid, property }, recovery ? { status, recovery } : { status })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Property.Update>
    }

    async resolve(property: string) {
        return (this.repository.findOneByOrFail({ property })
            .then((data) => { return { code: 0, data } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Property.Resolve>
    }

    constructor(database: Database) {
        this.database = database
        this.source = database.source
        this.repository = this.source.getRepository(Property)
    }
}