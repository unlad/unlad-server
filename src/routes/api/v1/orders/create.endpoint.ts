import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({
                        items: z.array(z.object({
                            uuid: z.string().uuid(),
                            amount: z.number().min(1)
                        }))
                    })

                    const { success, data } = schema.safeParse(req.body)
                    if (!success) return res.send({ code: 1 })

                    const { order } = server.orders.new(req.session.uuid!)
                    for (const item of data.items) order.add(item.uuid, item.amount)
                        
                    return res.send({ code: 0, oid: order.oid })
                }
            ]
        })
    ]
});