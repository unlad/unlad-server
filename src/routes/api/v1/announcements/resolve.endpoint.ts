import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { join } from "path";
import { existsSync, readFileSync } from "fs";

import { NextFunction, Request, Response } from "express"
import z from "zod";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({
                        uuid: z.string().uuid(),
                        content: z.string().optional()
                    })

                    const { success, data } = schema.safeParse(req.query)
                    if (!success) return res.send({ code: 1 })

                    const dir = join(global.__dirname, "..", "data", "announcements", data.uuid)
                    if (!existsSync(dir)) return res.send({ code: 2 })

                    if (data.content) {
                        const file = join(dir, "content")
                        if (!existsSync(file)) return res.send({ code: 3 })
                        res.setHeader("Content-type", "text/markdown")
                        return res.sendFile(file)
                    } else {
                        const file = join(dir, "meta")
                        if (!existsSync(file)) return res.send({ code: 3 })

                        const data = readFileSync(file).toString()
                        const parsed = JSON.parse(data)

                        return res.send({ code: 0, ...parsed })
                    }
                },  
            ]
        })
    ]
});