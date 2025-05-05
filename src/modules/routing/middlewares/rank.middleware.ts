import { NextFunction, Request, Response } from "express";
import { WebSocket } from "ws";

import { Server } from "modules/server/Server";
import { HTTPRouteHandler, WSRouteHandler } from "modules/routing/Routing";
import { Rank } from "modules/server/users/UserManager";

export function RankMiddleware(type: "HTTP", rank: Rank): HTTPRouteHandler
export function RankMiddleware(type: "WS", rank: Rank): WSRouteHandler
export function RankMiddleware(type: "HTTP" | "WS", rank: Rank) {
    switch(type) {
        case "HTTP":
            return ((server: Server, req: Request, res: Response, next: NextFunction) => {
                if (!req.session.rank) return res.status(401).send({ code: 401 })
                if (req.session.rank < rank) return res.status(403).send({ code: 403 })
                next()
            }) as HTTPRouteHandler

        case "WS":
            return ((server: Server, ws: WebSocket, req: Request, next: NextFunction) => {
                if (!req.session.rank) return ws.close()
                if (req.session.rank < rank) return ws.close()
                next()
            }) as WSRouteHandler
    }
}