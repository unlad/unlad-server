import { NextFunction, Request, Response } from "express";
import { WebSocket } from "ws";

import { Server } from "modules/server/Server";
import { HTTPRouteHandler, WSRouteHandler } from "modules/routing/RoutingManager";

export function AuthenticationMiddleware(type: "HTTP"): HTTPRouteHandler
export function AuthenticationMiddleware(type: "WS"): WSRouteHandler
export function AuthenticationMiddleware(type: "HTTP" | "WS") {
    switch(type) {
        case "HTTP":
            return ((server: Server, req: Request, res: Response, next: NextFunction) => {
                if (!req.session.uuid) return res.status(401).send()   
                next()
            }) as HTTPRouteHandler

        case "WS":
            return ((server: Server, ws: WebSocket, req: Request, next: NextFunction) => {
                if (!req.session.uuid) return ws.close()
                next()
            }) as WSRouteHandler
    }
}