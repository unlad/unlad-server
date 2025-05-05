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
            method: "GET",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const query = await server.users.list()
                    if (query.code) return res.send({ code: 2 })

                    res.send({ code: 0, users: query.users.map(user => {
                        return {
                            uuid: user.uuid,
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            created: new Date(user.created).valueOf()
                        }
                    })})
                },  
            ]
        })
    ]
});