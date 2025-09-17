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
                    const queryschema = z.object({ property: z.string().uuid() })
                    const { success, data } = queryschema.safeParse(req.query)
                    if (!success) return res.send({ code: 1 })

                    const query = await server.properties.resolve(data.property)
                    if (query.code) return res.send({ code: 3 })

                    res.send({ code: 0, data: query.data })
                },  
            ]
        })
    ]
});