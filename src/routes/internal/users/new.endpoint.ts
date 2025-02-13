import { Server } from "modules/server/Server";
import { HTTPEndpoint, Route } from "modules/routing/RoutingManager";

import { NextFunction, Request, Response } from "express";
import { v4 } from "uuid"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const uuid = v4()
                    const hash = await server.auth.getHash(req.body.secret)

                    const data = await server.database.users.create(uuid, req.body.id, req.body.username, hash)

                    res.send(data)
                },
            ]
        })
    ]
})