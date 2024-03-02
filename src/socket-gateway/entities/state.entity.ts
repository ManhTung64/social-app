import { Profile } from "../../auth/entities/profile.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostContent } from "../../post/entities/post.entity";

export enum StateType{
    like = 'like',
    dislike = 'dislike'
}
@Entity()
export class State{
    @PrimaryGeneratedColumn('uuid')
    id?:number
    
    @Column({type:'enum', enum:StateType})
    type:StateType

    @ManyToOne(()=>Profile,{cascade:true})
    @JoinColumn()
    user:Profile

    @ManyToOne(()=>PostContent,{cascade:true})
    @JoinColumn()
    post:PostContent

    @CreateDateColumn({select:false})
    createAt?:Date
}