import { DatabaseManager } from "modules/database/DatabaseManager"
import { QueryResults } from "modules/database/QueryResults"

export class BankDatabase {
    database: DatabaseManager

    async resolve(uuid: string) {
        const data = await this.database.call<QueryResults.Bank.Resolve>("bank.resolve", [uuid])
        return data;
    }

    async credit(uuid: string, amount: number) {
        const data = await this.database.call<QueryResults.Bank.Credit>("bank.credit", [uuid, amount])
        return data;
    }

    async deduct(uuid: string, amount: number) {
        const data = await this.database.call<QueryResults.Bank.Deduct>("bank.deduct", [uuid, amount])
        return data;
    }

    async transfer(sender: string, receiver: string, amount: number) {
        const data = await this.database.call<QueryResults.Bank.Transfer>("bank.transfer", [sender, receiver, amount])
        return data;
    }

    constructor(database: DatabaseManager) {
        this.database = database
    }
}