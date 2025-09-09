import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm"
import { Users } from "./Users"

@Entity()
export class Bank {
    @PrimaryColumn("uuid")
    @OneToOne(() => Users, (user) => user.uuid,  {
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "uuid" })
    uuid: string

    @Column({ type: "int", default: 0 })
    balance: number

    constructor(data: { uuid: string, balance: number }) {
        this.uuid = data.uuid
        this.balance = data.balance
    }
}
