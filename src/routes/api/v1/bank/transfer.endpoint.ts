import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";

import { NextFunction, Request, Response } from "express"
import { z } from "zod";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const sessionschema = z.object({ uuid: z.string() })
                    const session = sessionschema.safeParse(req.session)
                    if (!session.success) return res.send({ code: 1 })
                    
                    const bodyschema = z.object({ uuid: z.string().uuid(), amount: z.number().min(1) })
                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const query = await server.bank.transfer(session.data.uuid, body.data.uuid, body.data.amount)
                    if (query.code) return res.send({ code: 3 })

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});