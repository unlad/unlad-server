import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"
import { Rank } from "modules/managers/users/UserManager";

import { NextFunction, Request, Response } from "express"
import { z } from "zod";
import { sign } from "cookie-signature";
import { serialize } from "cookie"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    if (req.session.uuid) return res.send({ code: 1 })

                    const schema = z.object({
                        email: z.string().email(),
                        hash: z.string().length(128)
                    })

                    const { success, data } = schema.safeParse(req.body)
                    if (!success) return res.send({ code: 2 })

                    const authquery = await server.auth.authenticate(data.email, data.hash)
                    if (authquery.code) return res.send({ code: 3 })
                    
                    const userquery = await server.users.resolve(authquery.uuid)
                    if (userquery.code) return res.send({ code: 4 })

                    req.session.uuid = userquery.uuid
                    req.session.rank = userquery.rank as Rank

                    const signature = sign(req.session.id, server.secrets.session.toString())
                    const cookie = serialize("connect.sid", signature).split("=").join("=s%3A")

                    res.send({ code: 0, cookie })
                },  
            ]
        })
    ]
});