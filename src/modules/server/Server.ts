import http from "http"
import https from "https"
import { AddressInfo } from "net"

import express from "express"
import extend from "express-ws"
import cors from "cors"

export interface ServerStartOptions {
    ssl?: {
        key: Buffer | string,
        cert: Buffer | string
    } | false

    port?: number
}

export class Server {
    private _server?: http.Server | https.Server

    app: express.Application | extend.Application
    port: number | null = null

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

    constructor() {
        const app = express()

        app.use(express.json())
        app.use(cors())

        this.app = app
    }
}