import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({ uuid: z.string().uuid() })
                    const { success, data } = schema.safeParse(req.session)
                    if (!success) return res.send({ code: 1 })

                    
                    const query = await server.database.items.resolve(data.uuid)
                    if (query.code) return res.send({ code: 1 })

                    res.send({ 
                        code: 0,
                        uuid: query.data.uuid,
                        name: query.data.name,
                        description: query.data.description,
                        price: query.data.price
                    })
                },
            ]
        })
    ]
});