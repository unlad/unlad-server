import { Database } from "modules/database/Database"
import { QueryResults } from "modules/database/QueryResults"

export class UserDatabase {
    database: Database

    async resolve(uuid: string) {
        const data = await this.database.call<QueryResults.Users.Resolve>("user.resolve", [uuid])
        return data;
    }

    async list() {
        const data = await this.database.call<QueryResults.Users.List>("user.list", [])
        return data;
    }

    async create(uuid: string, id: string, name: string, email: string, hash: string) {
        const data = await this.database.call<QueryResults.Users.Create>("user.create", [uuid, id, name, email, hash])
        return data
    }

    async delete(uuid: string) {
        const data = await this.database.call<QueryResults.Users.Delete>("user.delete", [uuid])
        return data
    }

    async hash(handle: string) {
        const data = await this.database.call<QueryResults.Users.Hash>("user.hash", [handle])
        return data
    }

    async uuid(handle: string) {
        const data = await this.database.call<QueryResults.Users.UUID>("user.uuid", [handle])
        return data
    }

    async rank(uuid: string, rank: number) {
        const data = await this.database.call<QueryResults.Users.Rank>("user.rank", [uuid, rank])
        return data
    }

    constructor(database: Database) {
        this.database = database
    }
}