import { DatabaseManager } from "modules/database/DatabaseManager"
import { QueryResults } from "modules/database/QueryResults"

export class UserDatabase {
    database: DatabaseManager

    async resolve(uuid: string) {
        const data = await this.database.call<QueryResults.Users.Resolve>("user.resolve", [uuid])
        return data;
    }

    async list() {
        const data = await this.database.call<QueryResults.Users.List>("user.list", [])
        return data;
    }

    async create(uuid: string, id: string, email: string, hash: string) {
        const data = await this.database.call<QueryResults.Users.Create>("user.create", [uuid, id, email, hash])
        return data
    }

    async delete(uuid: string) {
        const data = await this.database.call<QueryResults.Users.Delete>("user.delete", [uuid])
        return data
    }

    async hash(email: string) {
        const data = await this.database.call<QueryResults.Users.Hash>("user.hash", [email])
        return data
    }

    async uuid(email: string) {
        const data = await this.database.call<QueryResults.Users.UUID>("user.uuid", [email])
        return data
    }

    async rank(uuid: string, rank: number) {
        const data = await this.database.call<QueryResults.Users.Rank>("user.rank", [uuid, rank])
        return data
    }

    constructor(database: DatabaseManager) {
        this.database = database
    }
}