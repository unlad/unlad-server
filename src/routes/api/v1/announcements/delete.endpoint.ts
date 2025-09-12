import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { join } from "path";
import { existsSync, rmSync } from "fs";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({
                        uuid: z.string().uuid()
                    })

                    const { success, data } = schema.safeParse(req.body)
                    if (!success) return res.send({ code: 1 })

                    const dir = join(global.__dirname, "..", "data", "announcements", data.uuid)
                    if (!existsSync(dir)) return res.send({ code: 2 })

                    try {
                        rmSync(dir, { recursive: true, force: true })
                    } catch (e) {
                        return res.send({ code: 3 })
                    }

                    return res.send({ code: 0 })
                },  
            ]
        })
    ]
});