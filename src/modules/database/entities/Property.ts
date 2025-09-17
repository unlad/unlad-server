import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm"
import { Users } from "./Users"

@Entity()
export class Property {
    @PrimaryColumn("uuid")
    @ManyToOne(() => Users, (user) => user.uuid,  {
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "uuid" })
    uuid: string
    
    @Column({ type: "uuid" })
    property: string

    @Column({ type: "integer" })
    status: number

    @Column({ type: "text" })
    name: string

    @Column({ type: "text" })
    description: string

    constructor(data: { uuid: string, property: string, status: number, name: string, description: string }) {
        this.uuid = data.uuid
        this.property = data.property
        this.status = data.status
        this.name = data.name
        this.description = data.description
    }
}
