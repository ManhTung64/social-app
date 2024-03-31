import { Profile } from "src/auth/entities/profile.entity";
import { Group } from "src/group/entities/group.entity";
import { FileInfo } from "src/post/entities/post.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'messages'})
export class MessageEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column({type:'varchar', nullable:true})
    @Index()
    content:string

    @CreateDateColumn()
    createAt:Date

    @Column({nullable:true, type:'jsonb'})
    files:FileInfo[]

    @ManyToOne(()=>Group,group=>group.id,{cascade:true, nullable:true})
    @JoinColumn({name:'groups_id'})
    group:Group

    @ManyToOne(()=>Profile,user=>user.id,{cascade:true})
    @JoinColumn({name:'sender_id'})
    sender:Profile

    @ManyToOne(()=>Profile,user=>user.id,{cascade:true, nullable:true})
    @JoinColumn({name:'receiver_user_id'})
    receiver:Profile

    @ManyToOne(()=>MessageEntity,message=>message.id,{cascade:true, nullable:true})
    @JoinColumn({name:'reply_to_id'})
    replyTo:MessageEntity
}