import { DatabaseManager } from "modules/database/DatabaseManager"
import { QueryResults } from "modules/database/QueryResults"
import { v4 } from "uuid";

export class TransactionDatabase {
    database: DatabaseManager

    async list(uuid: string) {
        const data = await this.database.call<QueryResults.Transactions.List>("transactions.list", [uuid])
        return data;
    }

    async resolve(tid: string) {
        const data = await this.database.call<QueryResults.Transactions.Resolve>("transactions.resolve", [tid])
        return data;
    }

    async add(uuid: string, items: string, comment?: string) {
        const tid = v4()

        const data = await this.database.call<QueryResults.Transactions.Add>("transactions.add", [uuid, tid, items, comment])
        return data;
    }

    constructor(database: DatabaseManager) {
        this.database = database
    }
}