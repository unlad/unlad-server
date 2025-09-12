import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"

import { join } from "path";
import { existsSync, readdirSync, readFileSync } from "fs";

import { NextFunction, Request, Response } from "express"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const path = join(global.__dirname, "..", "data", "announcements")
                    if (!existsSync(path)) return res.send({ code: 1 })

                    const dirs = readdirSync(path)
                    try {
                        const announcements = dirs.map(dir => {
                            const data = readFileSync(join(path, dir, "meta")).toString()
                            const parsed = JSON.parse(data)

                            return parsed
                        })

                        return res.send({ code: 0, announcements })
                    } catch (e) {
                        return res.send({ code: 2 })
                    }
                },  
            ]
        })
    ]
});