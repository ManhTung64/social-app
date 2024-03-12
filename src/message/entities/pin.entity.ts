import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { MessageEntity } from "./message.entity"

@Entity({name:'pin_message'})
export class PinMessageEntity{
    @PrimaryGeneratedColumn()
    id?:number

    @ManyToOne(()=>MessageEntity, message=>message.id, {cascade:true})
    message:MessageEntity
}