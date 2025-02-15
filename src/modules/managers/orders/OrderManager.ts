import { Server } from "modules/server/Server";
import { Item } from "modules/managers/items/ItemManager";

import EventEmitter from "events";
import { v4 } from "uuid";

export interface OrderItem extends Item {
    amount: number
}

export enum OrderStatus {
    CANCELLED = -1,
    PENDING = 0,
    CONFIRMED = 1,
    COMPLETED = 2,
    RECEIVED = 3
}

export class Order extends EventEmitter {
    server: Server
    uuid: string
    oid: string

    status: OrderStatus = OrderStatus.PENDING;
    items: Map<string, OrderItem> = new Map<string, OrderItem>()

    format() {
        console.log(this.items.size)
        if (!this.items.size) return { code: 1 } as const

        return {
            code: 0,
            items: Array.from(this.items.values()).map(item => `${item.uuid},${item.name},${item.amount},${item.price}`).join(";")
        } as const
    }

    price() {
        const price = Array.from(this.items.values()).map(item => item.price).reduce((a,b) => a + b)
        return { code: 0, price } as const
    }

    async pay() {
        const formatted = this.format()
        if (formatted.code) return { code: 1 } as const

        /*
        The code below may be dangerous, may need to replace in prod.
        Why? Deduction query and Transaction query are separate.
        If deduction succeeds but transaction fails, the transaction
        log will not show even if the payment went through.
        */

        // DANGEROUS //
        const deductquery = await this.server.database.bank.deduct(this.uuid, this.price().price)
        if (deductquery.code) return { code: 2 } as const

        const transactquery = await this.server.database.transactions.add(this.uuid, formatted.items, "Automated Payment")
        if (transactquery.code) return { code: 3 } as const
        // DANGEROUS //

        return { code: 0 } as const
    }

    add(uuid: string, amount: number) {
        const query = this.server.items.resolve(uuid)
        if (query.code) return { code: 1 } as const

        const item = query.item as OrderItem
        item.amount = amount

        this.items.set(item.uuid, item)

        return { code: 0 } as const
    }

    set(uuid: string, amount: number) {
        const item = this.items.get(uuid)
        if (!item) return { code: 1 } as const

        item.amount = amount
        
        this.items.set(uuid, item)
        return { code: 0 } as const
    }

    remove(uuid: string) {
        const item = this.items.get(uuid)
        if (!item) return { code: 1 } as const
        this.items.delete(uuid)

        return { code: 0 } as const
    }

    clear() {
        this.items.clear()
        return { code: 0 } as const
    }

    async confirm() {
        if (this.status !== OrderStatus.PENDING) return { code: 1 } as const

        const query = await this.pay();
        if (query.code) return { code: 2 } as const

        this.status = OrderStatus.CONFIRMED
        this.emit("status", this.status)

        return { code: 0 } as const
    }

    cancel() {
        if (this.status !== OrderStatus.PENDING) return { code: 1 } as const

        this.status = OrderStatus.CANCELLED
        this.emit("status", this.status)

        return { code: 0 } as const
    }

    complete() {
        if (this.status !== OrderStatus.CONFIRMED) return { code: 1 } as const
        
        this.status = OrderStatus.COMPLETED
        this.emit("status", this.status)

        return { code: 0 } as const
    }

    receive() {
        if (this.status !== OrderStatus.COMPLETED) return { code: 1 } as const
        
        this.status = OrderStatus.RECEIVED
        this.emit("status", this.status)
        
        return { code: 0 } as const
    }

    constructor(server: Server, uuid: string, oid: string) {
        super()
        
        this.server = server
        this.uuid = uuid
        this.oid = oid
    }
}

export class OrderManager extends EventEmitter {
    server: Server
    orders: Map<string, Order> = new Map<string, Order>()

    new(uuid: string) {
        const oid = v4()
        const order = new Order(this.server, uuid, oid)

        order.addListener("status", (status: OrderStatus) => {
            if (status == OrderStatus.RECEIVED || status == OrderStatus.CANCELLED) {
                this.remove(oid)
            }
        })

        this.orders.set(oid, order)
        this.emit("new", oid)

        return { code: 0, order } as const
    }

    get(oid: string) {
        const order = this.orders.get(oid)
        if (!order) return { code: 1 } as const
        
        return { code: 0, order } as const
    }

    list() {
        return {
            code: 0,
            orders: Array.from(this.orders.values())
        } as const
    }

    remove(oid: string) {
        const query = this.orders.delete(oid)
        if (query) this.emit("remove", oid)
        
        return { code: Number(!query) } as const
    }
    
    constructor(server: Server) {
        super()

        this.server = server
    }
}