import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Items {
    @PrimaryGeneratedColumn("uuid")
    uuid: string

    @Column()
    name: string

    @Column()
    type: string

    @Column()
    description: string

    @Column()
    price: number
}
