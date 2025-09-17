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

                    const bodyschema = z.object({ property: z.string().uuid(), lost: z.boolean() })
                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const resolvequery = await server.properties.resolve(body.data.property)
                    if (resolvequery.code) return res.send({ code: 3 })

                    const property = resolvequery.data

                    let status = 0
                    if (body.data.lost) {
                        if (property.status > 1) return res.send({ code: 4 })
                        status = property.recovery ? 2 : 3
                    } else {
                        if (property.status < 2) return res.send({ code: 4 })
                        status = 0
                    }

                    const updatequery = await server.properties.update(session.data.uuid, body.data.property, status, body.data.lost ? undefined : null)
                    if (updatequery.code) return res.send({ code: 5 })
                    
                    if (body.data.lost) res.send({ code: 0, recovery: property.recovery ?? false })
                    else res.send({ code: 0 })
                },  
            ]
        })
    ]
});