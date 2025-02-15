import { RoutingManager} from "modules/routing/RoutingManager";
import { DatabaseManager } from "modules/database/DatabaseManager";
import { SecretManager } from "modules/secrets/SecretManager";
import { AuthManager } from "modules/auth/AuthManager";
import { BankManager } from "modules/bank/BankManager";
import { ItemManager } from "modules/items/ItemManager";
import { MenuManager } from "modules/menu/MenuManager";
import { OrderManager } from "modules/orders/OrderManager";
import { CookieMiddleware } from "modules/routing/middlewares/cookies.middleware";

import express, { NextFunction, Request, Response } from "express";
import extend, { Application } from "express-ws"
import cors from "cors";
import http from "http";
import https from "https";


export class Server {
    app: Application

    routing: RoutingManager
    database: DatabaseManager
    secrets: SecretManager
    auth: AuthManager
    bank: BankManager
    items: ItemManager
    menu: MenuManager
    orders: OrderManager

    async start() {
        await this.database.connect()        
    }

    constructor() {
        this.secrets = new SecretManager()
        
        const app = express()

        if (process.env.ENV && process.env.ENV == "PROD") {
            const server = https.createServer({
                key: this.secrets.ssl.key,
                cert: this.secrets.ssl.cert
            }, app).listen(process.env.WEB_PORT || 443, () => {
                console.log("HTTPS production server started");
            });

            this.app = extend(app, server).app
        } else {
            const server = http.createServer({}, app).listen(process.env.WEB_PORT || 443, () => {
                console.log("HTTP test server started")
            })

            this.app = extend(app, server).app
        }
                
        this.app.use(express.json())
        this.app.use(CookieMiddleware())
        this.app.use(cors())

        this.routing = new RoutingManager(this)
        this.database = new DatabaseManager(this)
        this.auth = new AuthManager(this)
        this.bank = new BankManager(this)
        this.items = new ItemManager(this)
        this.menu = new MenuManager(this)
        this.orders = new OrderManager(this)
    }
}