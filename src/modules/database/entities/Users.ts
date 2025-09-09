import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class Users {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Column({ type: "text", unique: true })
    id: string

    @Column({ type: "text" })
    name: string

    @Column({ type: "text" })
    email: string

    @Column({ type: "text", select: false })
    hash: string

    @Column({ type: "int", default: 0 })
    rank: number

    @CreateDateColumn()
    created: Date

    constructor(data: { uuid: string, id: string, name: string, email: string, hash: string, rank: number, created: Date }) {
        this.uuid = data.uuid
        this.id = data.id
        this.name = data.name
        this.email = data.email
        this.hash = data.hash
        this.rank = data.rank
        this.created = data.created
    }
}
