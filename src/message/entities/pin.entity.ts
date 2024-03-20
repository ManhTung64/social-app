import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { MessageEntity } from "./message.entity"

@Entity({name:'pin_message'})
export class PinMessageEntity{
    @PrimaryGeneratedColumn()
    id?:number

    @OneToOne(()=>MessageEntity, message=>message.id, {cascade:true})
    @JoinColumn()
    message:MessageEntity
}