import "reflect-metadata"
import { DataSource } from "typeorm"
import { Users } from "./entities/Users"
import { Bank } from "./entities/Bank"
import { Items } from "./entities/Items"
import { Transactions } from "./entities/Transactions"

export default new DataSource({
    type: "postgres",
    host: "172.17.0.1",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "data",
    synchronize: true,
    logging: true,
    entities: [Users, Bank, Items, Transactions],
    migrations: [],
    subscribers: [],
})
