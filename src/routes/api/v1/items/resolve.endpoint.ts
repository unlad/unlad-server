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
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({ uuid: z.string().uuid() })
                    const { success, data } = schema.safeParse(req.query)
                    if (!success) return res.send({ code: 1 })
                    
                    const query = await server.items.resolve(data.uuid)
                    if (query.code) return res.send({ code: 1 })

                    res.send({ 
                        code: 0,
                        uuid: query.item.uuid,
                        name: query.item.name,
                        description: query.item.description,
                        price: query.item.price,
                        stock: query.item.stock
                    })
                },
            ]
        })
    ]
});