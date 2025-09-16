import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { NextFunction, Request, Response } from "express"
import { z } from "zod";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({
                        uuid: z.string().uuid(),
                        name: z.string().optional(),
                        type: z.string().optional(),
                        description: z.string().optional(),
                        price: z.number().min(0).optional(),
                        stock: z.number().min(0).optional()
                    })

                    const { success, data } = await schema.safeParse(req.body)
                    if (!success) return res.send({ code: 1 })
                    
                    if (data.name) {
                        const query = await server.items.rename(data.uuid, data.name)
                        if (query.code) return res.send({ code: 2 })
                    }

                    if (data.type) {
                        const query = await server.items.retype(data.uuid, data.type)
                        if (query.code) return res.send({ code: 2 })
                    }

                    if (data.description) {
                        const query = await server.items.redescribe(data.uuid, data.description)
                        if (query.code) return res.send({ code: 2 })
                    }

                    if (data.price) {
                        const query = await server.items.reprice(data.uuid, data.price)
                        if (query.code) return res.send({ code: 2 })
                    }

                    if (data.stock) {
                        const query = await server.items.restock(data.uuid, data.stock)
                        if (query.code) return res.send({ code: 2 })
                    }

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});