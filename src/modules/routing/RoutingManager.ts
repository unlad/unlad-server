import { join } from "path";
import { readdirSync, statSync } from "fs";

import { Server } from "modules/server/Server";
import { WebSocket } from "ws";
import { WebsocketRequestHandler } from "express-ws";

import { NextFunction, Request, Response } from "express";

export interface HTTPRouteHandler {
    (server: Server, req: Request, res: Response, next: NextFunction): void
}

export interface WSRouteHandler {
    (server: Server, ws: WebSocket, req: Request, next: NextFunction): void
}

export interface RouteOptions {
    endpoints: Endpoint[]
}

export interface HTTPEndpointOptions<Method> {
    method: Method
    handlers: HTTPRouteHandler[]
}

export interface WSEndpointOptions {
    handlers: WSRouteHandler[]
}

export type Endpoint = HTTPEndpoint<"ALL" | "GET" | "POST"> | WSEndpoint

export class Route {
    endpoints: Endpoint[];

    constructor(options: RouteOptions) {
        this.endpoints = options.endpoints
    }
}

export class HTTPEndpoint<Method extends "ALL" | "GET" | "POST"> {
    type = "http" as const;

    method: Method;
    handlers: HTTPRouteHandler[];

    constructor(options: HTTPEndpointOptions<Method>) {
        this.method = options.method;
        this.handlers = options.handlers;
    }
}

export class WSEndpoint {
    type = "ws" as const;

    handlers: WSRouteHandler[];

    constructor(options: WSEndpointOptions) {
        this.handlers = options.handlers
    }
}

export class RoutingManager {
    server: Server;

    async register(base: string) {
        const server = this.server
        const app = server.app

        async function registerRoute(routepath: string, data: Route) {
            for (let endpoint of data.endpoints) {
                const route = app.route(routepath)

                switch(endpoint.type) {
                    case "http":
                        const methods = {
                            "ALL": "all",
                            "GET": "get",
                            "POST": "post"
                        } as const;

                        const method = methods[endpoint.method]
                        route[method](...endpoint.handlers.map(handler => {
                            return async (req: Request, res: Response, next: NextFunction) => {
                                handler(server, req, res, next)
                            }
                        }))
                    break;

                    case "ws":
                        server.app.ws(routepath, ...endpoint.handlers.map(handler => {
                            return async (ws: WebSocket, req: Request, next: NextFunction) => {
                                handler(server, ws, req, next)
                            }
                        }))
                    break;
                }

                console.log(`Registered route ${routepath}`)
            }
        }

        async function getRoutes(path: string[] = []) {
            const dir = join(base, ...path);
            const items = readdirSync(dir);
    
            for (const item of items) {
                const file = join(dir, item);
    
                if (statSync(file).isFile()) {
                    if (!item.endsWith(".endpoint.ts")) continue

                    const route = "/" + [...path, item]
                        .join("/")
                        .slice(0, -1 * ".endpoint.ts".length)

                    const data: Route = (await import(`file://${file}`)).default as Route;

                    registerRoute(route, data)
                } else await getRoutes([...path, item]);
            }
        }
    
        await getRoutes();
    }

    constructor(server: Server) {
        this.server = server;
    }
}