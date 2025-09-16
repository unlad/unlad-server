import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from "typeorm"
import { Users } from "./Users"

@Entity()
export class Notifications {
    @PrimaryColumn("uuid")
    @OneToOne(() => Users, (user) => user.uuid,  {
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "uuid" })
    uuid: string

    @Column({ type: "text" })
    type: string

    @Column({ type: "text" })
    token: string

    constructor(data: { uuid: string, type: string,token: string }) {
        this.uuid = data.uuid
        this.type = data.type
        this.token = data.token
    }
}
