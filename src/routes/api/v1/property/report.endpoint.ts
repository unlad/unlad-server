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

                    const bodyschema = z.object({ property: z.string().uuid(), surrendered: z.boolean(), message: z.string().optional() })
                    const body = bodyschema.safeParse(req.body)
                    if (!body.success) return res.send({ code: 2 })

                    const resolvequery = await server.properties.resolve(body.data.property)
                    if (resolvequery.code) return res.send({ code: 3 })

                    const property = resolvequery.data
                    if (property.status != 0 && property.status != 3 && property.recovery) return res.send({ code: 4 })

                    const updatequery = await server.properties.update(property.uuid, property.property, property.status == 0 ? 1 : 2, {
                        uuid: session.data.uuid,
                        surrendered: body.data.surrendered,
                        message: body.data.message,
                        timestamp: Date.now()
                    })
                    if (updatequery.code) return res.send({ code: 5})

                    res.send({ code: 0 })
                },  
            ]
        })
    ]
});