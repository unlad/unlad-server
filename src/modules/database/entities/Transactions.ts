import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Transactions {
    @PrimaryGeneratedColumn("uuid")
    tid: string

    @Column("uuid", { unique: true, generated: "uuid" })
    uuid: string

    @Column("json", { array: false })
    items: {
        uuid: string
        name: string
        price: number
        amount: number
    }[]

    @Column({ type: "text" })
    comment: string

    @CreateDateColumn()
    created: Date

    constructor(data: { tid: string, uuid: string, items: { uuid: string, name: string, price: number, amount: number }[], comment: string, created: Date }) {
        this.tid = data.tid
        this.uuid = data.uuid
        this.items = data.items
        this.comment = data.comment
        this.created = data.created
    }
}
