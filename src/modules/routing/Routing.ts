import { join } from "path";
import { readdirSync, statSync } from "fs";

import { Request, Response, NextFunction } from "express"
import { WebSocket } from "ws"

import { Server } from "modules/server/Server"
import { LogMiddleware } from "modules/routing/middlewares/log.middleware";

export type HTTPRouteHandler = {
    (server: Server, req: Request, res: Response, next: NextFunction): void
}

export type WSRouteHandler = {
    (server: Server, ws: WebSocket, req: Request, next: NextFunction): void
}

export type RouteOptions = {
    endpoints: Endpoint[]
}

export type HTTPEndpointOptions<Method> = {
    method: Method
    params?: string[]
    handlers: HTTPRouteHandler[]
}

export type WSEndpointOptions = {
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
    params?: string[]
    handlers: HTTPRouteHandler[];

    constructor(options: HTTPEndpointOptions<Method>) {
        this.method = options.method;
        this.params = options.params
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

export class Routing {
    async getRoutes(base: string, path: string[] = []): Promise<{ path: string, data: Route }[]> {
        const routes = []
        const dir = join(base, ...path);
        const items = readdirSync(dir);

        for (const item of items) {
            const file = join(dir, item);

            if (statSync(file).isFile()) {
                if (!item.endsWith(".endpoint.ts")) continue

                const route = "/" + [...path, item]
                    .join("/")
                    .slice(0, -1 * ".endpoint.ts".length)

                const data: Route = (await import(`file:///${file}`)).default as Route;
                routes.push({ path: route, data })
            } else routes.push(...await this.getRoutes(base, [...path, item]));
        }

        return routes
    }

    async registerRoute(server: Server, routepath: string, data: Route) {
        for (let endpoint of data.endpoints) {
            let route = server.app.route(routepath)

            switch(endpoint.type) {
                case "http":
                    const methods = {
                        "ALL": "all",
                        "GET": "get",
                        "POST": "post"
                    } as const;

                    const method = methods[endpoint.method]

                    if (endpoint.params) {
                        const params = endpoint.params.map(query => `:${query}`)
                        route = server.app.route([route.path, ...params].join("/"))
                    }

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
    
    async register(server: Server, source?: string) {
        source = source ?? join(__dirname, "routes")
        const routes = await this.getRoutes(source)
        
        server.app.use(LogMiddleware())

        for (const route of routes) {
            this.registerRoute(server, route.path, route.data)
        }
    }
}