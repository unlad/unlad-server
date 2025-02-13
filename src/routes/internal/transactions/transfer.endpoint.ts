import { Server } from "modules/server/Server";
import { HTTPEndpoint, Route } from "modules/routing/RoutingManager";

import { NextFunction, Request, Response } from "express";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const data = await server.database.bank.transfer(req.body.sender, req.body.receiver, req.body.amount)

                    res.send(data)
                },
            ]
        })
    ]
})