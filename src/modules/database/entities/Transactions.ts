import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Transactions {
    @PrimaryGeneratedColumn("uuid")
    tid: string

    @Column("uuid", { unique: true })
    uuid: string

    @Column("json", { array: true })
    items: {
        uuid: string
        price: number
        amount: number
    }[]

    @Column()
    comment: string

    @CreateDateColumn()
    created: Date
}
