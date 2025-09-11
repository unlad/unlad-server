import { AuthManager } from "modules/server/auth/AuthManager";
import { BankManager } from "modules/server/bank/BankManager";
import { ItemManager } from "modules/server/items/ItemManager";
import { MenuManager } from "modules/server/menu/MenuManager";
import { OrderManager } from "modules/server/orders/OrderManager";
import { TransactionManager } from "modules/server/transactions/TransactionManager";
import { UserManager } from "modules/server/users/UserManager";
import { Database } from "modules/database/Database";

import http from "http"
import https from "https"
import { AddressInfo } from "net"
import { join } from "path";

import express from "express"
import extend, { Application } from "express-ws"
import cors from "cors"
import fileUpload from "express-fileupload";

export type ServerInitOptions = {
    auth: {
        secret: string
        max_age: number
    }
}

export type ServerStartOptions = {
    ssl?: {
        key: Buffer | string,
        cert: Buffer | string
    } | false

    port?: number
}

export class Server {
    private _server?: http.Server | https.Server

    app: Application
    port: number | null = null

    auth: AuthManager
    users: UserManager
    bank: BankManager
    items: ItemManager
    menu: MenuManager
    orders: OrderManager
    transactions: TransactionManager

    async start(options?: ServerStartOptions): Promise<{ ssl: boolean, port: number }> {
        options = options ?? {}
        options.ssl = options.ssl ?? false
        options.port = options.port ?? 0

        return new Promise((res) => {
            if (options.ssl) this._server = https.createServer(options.ssl, this.app)
            else this._server = http.createServer({}, this.app)
    
            this._server.listen(options.port, () => {
                const port = (this._server?.address() as AddressInfo).port
                this.port = port
    
                console.log(`${options.ssl ? "HTTPS production" : "HTTP test"} server started`);
                res({ ssl: Boolean(options.ssl), port })
            })
    
            this.app = extend(this.app, this._server).app
        })
    }

    async stop() {
        this._server?.closeAllConnections()
        this._server?.close()
        this._server?.unref()
    }

    constructor(database: Database, options: ServerInitOptions) {
        const app = express()
        app.use(express.static('static'))

        app.use(express.json());
        app.use(cors());

        app.use(fileUpload({
            limits: { fileSize: 2 * 1024 * 1024 },
            useTempFiles: true,
            tempFileDir: join(global.__dirname, "..", "tmp"),
            safeFileNames: true,
            abortOnLimit: true,
            responseOnLimit: JSON.stringify({ code: 413 })
        }))

        // force extended express type hack
        this.app = extend(app).app

        this.auth = new AuthManager(database, this, { secret: options.auth.secret, max_age: options.auth.max_age } )
        this.users = new UserManager(database)
        this.bank = new BankManager(database)
        this.items = new ItemManager(database)
        this.menu = new MenuManager(this.items)
        this.orders = new OrderManager(database, this.items)
        this.transactions = new TransactionManager(database)
    }
}