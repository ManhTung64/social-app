import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostContent } from "./post.entity";
import { Profile } from "../../auth/entities/profile.entity";

@Entity('comments')
export class Comment{
    @PrimaryGeneratedColumn('uuid')
    id?:number

    @Column()
    content:string

    @CreateDateColumn()
    @UpdateDateColumn()
    updateAt?:Date

    @ManyToOne(()=>Profile, user=>user.id,{cascade:true})
    @JoinColumn()
    user:Profile

    @ManyToOne(()=> PostContent, post=>post.id,{cascade:true})
    @JoinColumn()
    post:PostContent
}