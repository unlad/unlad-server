import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { Rank } from "modules/server/users/UserManager";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const sessionschema = z.object({ uuid: z.string(), rank: z.number() })
                    const session = sessionschema.safeParse(req.session)
                    if (!session.success) return res.send({ code: 1 })
                    
                    const bodyschema = z.object({ oid: z.string().uuid() })
                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const query = server.orders.get(body.data.oid)
                    if (query.code) return res.send({ code: 3 }) 
                    if (query.order.uuid !== session.data.uuid && session.data.rank < Rank.ADMIN) return res.send({ code: 4 })
                    
                    const items = Array.from(query.order.items.values()).map(item => { return { uuid: item.uuid, amount: item.amount } }).join(";")
                    res.send({ code: 0, uuid: query.order.uuid, items })
                }
            ]
        })
    ]
});