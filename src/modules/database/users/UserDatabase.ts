import { Database } from "modules/database/Database"
import { Users } from "modules/database/entities/Users"
import { Bank } from "modules/database/entities/Bank"
import { QueryResults } from "modules/database/QueryResults"

import { DataSource, Repository } from "typeorm"

export class UserDatabase {
    database: Database
    source: DataSource
    repository: Repository<Users>

    async resolve(uuid: string) {
        return (this.repository.findOneByOrFail({ uuid })
            .then((data) => { return { code: 0, data } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Users.Resolve>
    }

    async list() {
        return (this.repository.find()
            .then((users) => { return { code: 0, users } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Users.List>
    }

    async create(id: string, name: string, email: string, hash: string) {
        const runner = this.source.createQueryRunner()
        await runner.connect()
        await runner.startTransaction()

        try {
            const userresult = await this.repository.insert({ id, name, email, hash })
            const bankresult = await this.source.getRepository(Bank).insert({ uuid: userresult.identifiers[0].uuid })

            await runner.commitTransaction()
            return { code: userresult.identifiers.length && bankresult.identifiers.length ? 0 : 1 } as QueryResults.Bank.Transfer
        } catch (e) {
            await runner.rollbackTransaction()
            return { code: 1 } as QueryResults.Bank.Transfer
        } finally {
            await runner.release()
        }
    }

    async delete(uuid: string) {
        return (this.repository.delete({ uuid })
            .then(() => { return { code: 0 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Users.UUID>
    }

    async hash(email: string) {
        return (this.repository.findOneOrFail({ select: { hash: true }, where: { email } })
            .then(({ hash }) => { return { code: 0, data: { hash } } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Users.Hash>
    }

    async uuid(email: string) {
        return (this.repository.findOneByOrFail({ email })
            .then(({ uuid }) => { return { code: 0, data: { uuid } } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Users.UUID>
    }

    async rank(uuid: string, rank: number) {
        return (this.repository.update({ uuid }, { rank })
            .then(results => { return { code: results.affected ? 0 : 1 } })
            .catch(() => { return { code: 1 } })
        ) as Promise<QueryResults.Users.Rank>
    }

    constructor(database: Database) {
        this.database = database
        this.source = database.source
        this.repository = this.source.getRepository(Users)
    }
}