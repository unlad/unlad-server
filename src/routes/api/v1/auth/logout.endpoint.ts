import { Route, HTTPEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"

import { NextFunction, Request, Response } from "express";

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "POST",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    if (!req.session.uuid) return res.send({ code: 1 })

                    req.session.destroy(err => {
                        if (err) res.send({ code: 2 })
                        else res.send({ code: 0 })
                    })
                },
            ]
        })
    ]
});