import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"
import { Rank } from "modules/routing/middlewares/rank.middleware";

import { NextFunction, Request, Response } from "express"
import { z } from "zod";
import { sign } from "cookie-signature";
import { serialize } from "cookie"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    if (req.session.uuid) return res.send({ code: 1 })

                    const schema = z.object({
                        username: z.string().min(3).max(32),
                        hash: z.string().length(128)
                    })

                    const { success, data } = schema.safeParse(req.body)
                    if (!success) return res.send({ code: 2 })

                    const authquery = await server.auth.authenticate(data.username, data.hash)
                    if (authquery.code) return res.send({ code: 3 })
                    
                    const userquery = await server.database.users.resolve(authquery.uuid)
                    if (userquery.code) return res.send({ code: 4 })

                    req.session.uuid = authquery.uuid
                    req.session.rank = userquery.data.rank as Rank

                    const signature = sign(req.session.id, server.secrets.session.toString())
                    const cookie = serialize("connect.sid", signature).split("=").join("=s%3A")

                    res.send({ code: 0, cookie })
                },  
            ]
        })
    ]
});