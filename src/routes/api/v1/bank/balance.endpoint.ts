import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";

import { NextFunction, Request, Response } from "express"
import { z } from "zod";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({ uuid: z.string().uuid() })
                    const { success, data } = schema.safeParse(req.session)
                    if (!success) return res.send({ code: 1 })

                    const query = await server.bank.resolve(data.uuid)
                    if (query.code) return res.send({ code: 2 })

                    res.send({ code: 0, balance: query.balance })
                },
            ]
        })
    ]
});