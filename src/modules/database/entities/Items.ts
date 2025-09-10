import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Items {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Column({ type: "text" })
    name: string

    @Column({ type: "text" })
    type: string

    @Column({ type: "text" })
    description: string

    @Column({ type: "int" })
    price: number

    @Column({ type: "int", default: 0 })
    stock: number

    constructor(data: { uuid: string, name: string, type: string, description: string, price: number, stock: number }) {
        this.uuid = data.uuid
        this.name = data.name
        this.type = data.type
        this.description = data.description
        this.price = data.price
        this.stock = data.stock
    }
}
