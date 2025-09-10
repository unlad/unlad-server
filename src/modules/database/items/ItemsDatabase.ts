import { Database } from "modules/database/Database"
import { Items } from "modules/database/entities/Items"
import { QueryResults } from "modules/database/QueryResults"

import { DataSource, Repository } from "typeorm"

export class ItemsDatabase {
    database: Database
    source: DataSource
    repository: Repository<Items>

    async list() {
        return (this.repository.find()
            .then((items) => { return { code: 0, items } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.List>
    }

    async create(name: string, type: string, description: string, price: number) {
        return (this.repository.insert({ name, type, description, price })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Create>
    }

    async delete(uuid: string) {
        return (this.repository.delete({ uuid })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Delete>
    }

    async resolve(uuid: string) {
        return (this.repository.findOneByOrFail({ uuid })
            .then((data) => { return { code: 0, data } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Resolve>
    }

    async rename(uuid: string, name: string) {
        return (this.repository.update({ uuid }, { name })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Rename>
    }

    async retype(uuid: string, type: string) {
        return (this.repository.update({ uuid }, { type })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Retype>
    }

    async redescribe(uuid: string, description: string) {
        return (this.repository.update({ uuid }, { description })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Redescribe>
    }

    async reprice(uuid: string, price: number) {
        return (this.repository.update({ uuid }, { price })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Reprice>
    }

    async restock(uuid: string, inventory: number) {
        return (this.repository.update({ uuid }, { stock: inventory })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Items.Restock>
    }

    constructor(database: Database) {
        this.database = database
        this.source = database.source
        this.repository = this.source.getRepository(Items)
    }
}