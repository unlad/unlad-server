import { Route, HTTPEndpoint } from "modules/routing/Routing";
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
                    const sessionschema = z.object({ uuid: z.string().uuid() })
                    const session = sessionschema.safeParse(req.session)
                    if (!session.success) return res.send({ code: 1 })

                    const bodyschema = z.object({ property: z.string().uuid() })
                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const query = await server.properties.unregister(session.data.uuid, body.data.property)
                    if (query.code) return res.send({ code: 3 })

                    res.send({ code: 0 })
                },  
            ]
        })
    ]
});