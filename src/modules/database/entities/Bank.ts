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

    @Column({ default: 0 })
    balance: number
}
