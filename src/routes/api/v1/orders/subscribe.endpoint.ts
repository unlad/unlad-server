import { Route, WSEndpoint } from "modules/routing/Routing";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";

import { NextFunction, Request } from "express"
import { z } from "zod"
import { WebSocket } from "ws";

export default new Route({
    endpoints: [
        new WSEndpoint({
            handlers: [
                AuthenticationMiddleware("WS"),
                async (server: Server, ws: WebSocket, req: Request, next: NextFunction) => {
                    const schema = z.object({
                        oid: z.string().uuid()
                    })
                    
                    const { success, data } = schema.safeParse(req.query)
                    if (!success) return ws.close()

                    const query = server.orders.get(data.oid)
                    if (query.code) return ws.close()
                    if (query.order.uuid !== req.session.uuid) return ws.close()

                    const order = query.order

                    function update() {
                        ws.send(JSON.stringify({ status: order.status }))
                        
                        order.prependOnceListener("remove", ws.close)
                    }
                    
                    ws.send(JSON.stringify({ status: order.status }))
                    order.addListener("status", update)
                    
                    ws.once('close', () => order.removeListener("status", update))
                }
            ]
        })
    ]
});