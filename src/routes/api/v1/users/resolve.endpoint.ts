import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { Rank } from "modules/server/users/UserManager";

import { NextFunction, Request, Response } from "express"
import { z } from "zod"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const sessionschema = z.object({ uuid: z.string().uuid(), rank: z.number() })
                    const session = sessionschema.safeParse(req.session)
                    if (!session.success) return res.send({ code: 1 })

                    let uuid = session.data.uuid

                    if (session.data.rank >= Rank.ADMIN) {
                        const bodyschema = z.object({ uuid: z.optional(z.string().uuid()) })
                        const body = bodyschema.safeParse(req.query)
                        if (!body.success) return res.send({ code: 2 })
                        
                        if (body.data.uuid) uuid = body.data.uuid
                    }

                    const query = await server.users.resolve(uuid)
                    if (query.code) return res.send({ code: 3 })

                    res.send({ 
                        code: 0,
                        uuid: query.uuid,
                        id: query.id,
                        name: query.name,
                        email: query.email,
                        rank: query.rank,
                        created: new Date(query.created).valueOf()
                    })
                },  
            ]
        })
    ]
});