import { DataSourceOptions } from "typeorm"
import { Users } from "./entities/Users"
import { Bank } from "./entities/Bank"
import { Items } from "./entities/Items"
import { Transactions } from "./entities/Transactions"

export default {
    type: "postgres",
    host: "172.17.0.1",
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [Users, Bank, Items, Transactions],
    migrations: [],
    subscribers: [],
    entitySkipConstructor: true
} as DataSourceOptions
