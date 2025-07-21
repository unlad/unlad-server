import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class Users {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Column({ unique: true })
    id: string

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    hash: string

    @Column({ default: 0 })
    rank: number

    @CreateDateColumn()
    created: Date
}
