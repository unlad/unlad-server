import { DataSourceOptions } from "typeorm"
import { Users } from "modules/database/entities/Users"
import { Bank } from "modules/database/entities/Bank"
import { Items } from "modules/database/entities/Items"
import { Transactions } from "modules/database/entities/Transactions"
import { Notifications } from "modules/database/entities/Notifications"
import { Property } from "modules/database/entities/Property"

export default {
    type: "postgres",
    host: "172.17.0.1",
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [Users, Bank, Items, Transactions, Notifications, Property],
    migrations: [],
    subscribers: [],
    entitySkipConstructor: true
} as DataSourceOptions
