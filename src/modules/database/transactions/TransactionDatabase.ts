import { Database } from "modules/database/Database"
import { Transactions } from "modules/database/entities/Transactions"
import { QueryResults } from "modules/database/QueryResults"

import { DataSource, Repository } from "typeorm"

export class TransactionDatabase {
    database: Database
    source: DataSource
    repository: Repository<Transactions>

    async list(uuid: string) {
        return (this.repository.findBy({ uuid })
            .then((transactions) => { return { code: 0, transactions } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Transactions.List>
    }

    async resolve(tid: string) {
        return (this.repository.findOneByOrFail({ tid })
            .then((data) => { return { code: 0, data } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Transactions.Resolve>
    }

    async add(uuid: string, items: { uuid: string, name: string, price: number, amount: number }[], comment?: string) {
        return (this.repository.insert({ uuid, items, comment })
            .then(() => { return { code: 0 } })
            .catch((e) => { return { code: 1 } })
        ) as Promise<QueryResults.Transactions.Add>
    }

    constructor(database: Database) {
        this.database = database
        this.source = database.source
        this.repository = this.source.getRepository(Transactions)
    }
}