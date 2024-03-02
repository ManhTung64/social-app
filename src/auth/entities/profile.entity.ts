import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { User } from "./user.entity";
import { PostContent } from "../../post/entities/post.entity";
import { Group } from "../../group/entities/group.entity";

@Entity({ name: 'profile' })
export class Profile {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number

    @Column("varchar")
    name: string

    @Column({ nullable: true })
    dob: Date

    @Column({ nullable: true })
    phonenumber: string

    @CreateDateColumn()
    @UpdateDateColumn()
    updateAt: Date

    @OneToOne(() => User, user => user.id,{cascade:['update']})
    @JoinColumn()
    user: User

    @OneToMany(() => PostContent, post => post.id, { cascade: true })
    @JoinColumn()
    posts: PostContent[]

    @ManyToMany(() => Group, group => group.members,{onDelete:'CASCADE'})
    @JoinTable({name:'member_group'})
    groups: Group[];

    @Column({nullable:true})
    avatar:string
}