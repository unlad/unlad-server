import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const sessionschema = z.object({ uuid: z.string().uuid() })
                    const session = sessionschema.safeParse(req.session)
                    if (!session.success) return res.send({ code: 1 })

                    const paramschema = z.object({ tid: z.string().uuid() })
                    const param = paramschema.safeParse(req.query)
                    if (!param.success) return res.send({ code: 2 })

                    const query = await server.transactions.resolve(param.data.tid)
                    if (query.code) return res.send({ code: 3 })
                    if (query.uuid !== session.data.uuid) return res.send({ code: 4 })

                    res.send({
                        code: 0,
                        uuid: query.uuid,
                        tid: query.tid,
                        items: query.items,
                        comment: query.comment,
                        timestamp: query.timestamp
                    })
                },
            ]
        })
    ]
});