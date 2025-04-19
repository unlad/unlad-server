import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { Rank } from "modules/server/users/UserManager";

import { NextFunction, Request, Response } from "express"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                AuthenticationMiddleware("HTTP"),
                RankMiddleware("HTTP", Rank.ADMIN),
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const query = server.menu.clear()
                    if (query.code) return res.send({ code: 1 })

                    res.send({ code: 0 })
                },
            ]
        })
    ]
});