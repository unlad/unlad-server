import { Database } from "modules/database/Database"
import { QueryResults } from "modules/database/QueryResults"

export class ItemsDatabase {
    database: Database

    async list() {
        const data = await this.database.call<QueryResults.Items.List>("items.list", [])
        return data;
    }

    async create(uuid: string, name: string, description: string, price: number) {
        const data = await this.database.call<QueryResults.Items.Create>("items.create", [uuid, name, description, price])
        return data;
    }

    async delete(uuid: string) {
        const data = await this.database.call<QueryResults.Items.Delete>("items.delete", [uuid])
        return data;
    }

    async resolve(uuid: string) {
        const data = await this.database.call<QueryResults.Items.Resolve>("items.resolve", [uuid])
        return data;
    }

    async rename(uuid: string, name: string) {
        const data = await this.database.call<QueryResults.Items.Rename>("items.rename", [uuid, name])
        return data;
    }

    async redescribe(uuid: string, description: string) {
        const data = await this.database.call<QueryResults.Items.Redescribe>("items.redescribe", [uuid, description])
        return data;
    }

    async reprice(uuid: string, price: number) {
        const data = await this.database.call<QueryResults.Items.Reprice>("items.reprice", [uuid, price])
        return data;
    }

    constructor(database: Database) {
        this.database = database
    }
}