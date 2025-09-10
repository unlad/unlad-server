import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { Rank } from "modules/server/users/UserManager";
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";

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
                        oid: z.string().uuid(),
                        status: z.number().min(-1).max(3).refine(status => status !== 0)
                    })

                    const { success, data } = schema.safeParse(req.body)
                    if (!success) return res.send({ code: 1 })

                    const query = server.orders.get(data.oid)
                    if (query.code) return res.send({ code: 2 })

                    const order = query.order

                    let result
                    switch(data.status) {
                        case -1: 
                            result = order.cancel()
                            break

                        case 1: 
                            result = await order.confirm()
                            break
                        case 2:
                            result = order.complete()
                            break
                        case 3:
                            result = order.receive()
                            break

                        default: return res.send({ code: 3 })
                    }

                    if (result.code) return res.send({ code: 4 })
                    res.send({ code: 0 })
                }
            ]
        })
    ]
});