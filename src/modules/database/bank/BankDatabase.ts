import { Database } from "modules/database/Database"
import { Bank } from "modules/database/entities/Bank"
import { QueryResults } from "modules/database/QueryResults"

import { DataSource, Repository } from "typeorm"

export class BankDatabase {
    database: Database
    source: DataSource
    repository: Repository<Bank>

    async resolve(uuid: string) {
        return (this.repository.findOneByOrFail({ uuid })
            .then(data => { return { code: 0, data } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Bank.Resolve>
    }

    async credit(uuid: string, amount: number) {
        return (this.repository.update({ uuid }, { balance: () => `balance + ${amount}`})
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Bank.Credit>
    }

    async deduct(uuid: string, amount: number) {
        return (this.repository.update({ uuid }, { balance: () => `balance - ${amount}`})
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Bank.Deduct>
    }

    async transfer(sender: string, receiver: string, amount: number) {
        const runner = this.source.createQueryRunner()
        await runner.connect()
        await runner.startTransaction()

        try {
            const sendresult = await this.repository.update({ uuid: sender }, { balance: () => `balance - ${amount}`})
            const receiveresult = await this.repository.update({ uuid: receiver }, { balance: () => `balance + ${amount}`})

            await runner.commitTransaction()
            return { code: sendresult.affected && receiveresult.affected ? 0 : 1 } as QueryResults.Bank.Transfer
        } catch (e) {
            await runner.rollbackTransaction()
            return { code: 1 } as QueryResults.Bank.Transfer
        } finally {
            await runner.release()
        }
    }

    constructor(database: Database) {
        this.database = database
        this.source = database.source
        this.repository = this.source.getRepository(Bank)
    }
}