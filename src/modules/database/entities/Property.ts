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
    
    @Column({ type: "text" })
    name: string
    
    @Column({ type: "text" })
    description: string
    
    @Column({ type: "integer", default: 0 })
    status: number

    @Column({ type: "json", array: false, nullable: true })
    recovery: {
        uuid: string
        surrendered: boolean
        message?: string
        timestamp: number
    } | null
    
    @Column({ type: "uuid", generated: "uuid" })
    property: string 

    constructor(data: { uuid: string, name: string, description: string, status: number, recovery: { uuid: string, surrendered: boolean, message?: string, timestamp: number }, property: string }) {
        this.uuid = data.uuid
        this.name = data.name
        this.description = data.description
        this.status = data.status
        this.recovery = data.recovery
        this.property = data.property
    }
}
