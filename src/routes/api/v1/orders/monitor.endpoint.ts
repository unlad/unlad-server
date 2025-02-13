import { Route, WSEndpoint } from "modules/routing/RoutingManager";
import { Server } from "modules/server/Server"
import { AuthenticationMiddleware } from "modules/routing/middlewares/auth.middleware";
import { Rank, RankMiddleware } from "modules/routing/middlewares/rank.middleware";
import { OrderStatus } from "modules/orders/OrderManager";

import { NextFunction, Request } from "express"
import { WebSocket } from "ws";

export default new Route({
    endpoints: [
        new WSEndpoint({
            handlers: [
                AuthenticationMiddleware("WS"),
                RankMiddleware("WS", Rank.ADMIN),
                async (server: Server, ws: WebSocket, req: Request, next: NextFunction) => {
                    function handleOrder(oid: string) {
                        const query = server.orders.get(oid)
                        if (query.code) return ws.close()

                        ws.send(JSON.stringify({ type: "new", oid }))
                        ws.send(JSON.stringify({ type: "update", oid, status: 0 }))

                        const order = query.order
                        
                        function handleStatus(status: OrderStatus) {                        
                            if (status == OrderStatus.RECEIVED || status == OrderStatus.CANCELLED) {
                                ws.send(JSON.stringify({ type: "remove", oid }))
                                order.removeListener("status", handleStatus)
                            } else {
                                ws.send(JSON.stringify({ type: "update", oid, status }))
                            }
                        }

                        order.addListener("status", handleStatus)
                    }

                    const query = server.orders.list()
                    if (query.code) return ws.close()

                    for (const order of query.orders) {
                        ws.send(JSON.stringify({ type: "new", oid: order.oid }))
                        ws.send(JSON.stringify({ type: "update", oid: order.oid, status: order.status }))
                    }
                    
                    server.orders.addListener("new", handleOrder)
                    ws.once("close", () => server.orders.removeListener("new", handleOrder))
                }
            ]
        })
    ]
});