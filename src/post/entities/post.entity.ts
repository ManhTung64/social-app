import { Profile } from "../../auth/entities/profile.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "./comment.entity";

@Entity('post')
@Index('idx_title',['title'])
export class PostContent{
    @PrimaryGeneratedColumn('uuid')
    id: number
    
    @Column()
    @Index({fulltext:true})
    title:string

    @Column()
    content:string

    @Column()
    hashtag:string

    @Column({nullable:true, type:'jsonb'})
    files:FileInfo[]

    @CreateDateColumn()
    @UpdateDateColumn()
    updateAt:Date

    @ManyToOne(() => Profile,profile=>profile.id, { cascade: true })
    @JoinColumn()
    user: Profile;

    @OneToMany(()=>Comment,comment=>comment.id,{onDelete:'CASCADE'})
    @JoinColumn()
    comments:Comment[]
}
export interface FileInfo {
    type: string
    url: string
    no:number
  }