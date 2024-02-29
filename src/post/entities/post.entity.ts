import { Profile } from "src/auth/entities/user/profile.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}
export interface FileInfo {
    type: string
    url: string
    no:number
  }