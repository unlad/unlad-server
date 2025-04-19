import { Route, HTTPEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { NextFunction, Request, Response } from "express"

export default new Route({
    endpoints: [
        new HTTPEndpoint({
            method: "GET",
            handlers: [
                async (server: Server, req: Request, res: Response, next: NextFunction) => {
                    const query = server.menu.resolve()
                    res.send({ code: 0, menu: query.menu })
                },
            ]
        })
    ]
});