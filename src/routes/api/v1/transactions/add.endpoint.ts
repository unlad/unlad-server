import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const schema = z.object({
                        items: z.array(z.object({ 
                            uuid: z.string().uuid(),
                            amount: z.number().min(1)
                        })),
                        comment: z.string().optional()
                    })

                    const { success, data } = schema.safeParse(req.body)
                    if (!success) return res.send({ code: 1 })

                    const items = data.items.map(({ uuid, amount }) => {
                        let result = server.items.resolve(uuid)
                        if (result.code) return null

                        let { name, price } = result.item
                        return { uuid, name, price, amount }
                    })

                    if (items.includes(null)) return res.send({ code: 2 })

                    const query = await server.transactions.add(items.filter(item => !!item), data.comment)
                    if (query.code) return res.send({ code: 3 })

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});