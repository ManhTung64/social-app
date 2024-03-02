// import { profile } from "console";
import { Profile } from "../../auth/entities/profile.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('group')
export class Group {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column()
    name: string

    @Column()
    content: string

    @ManyToOne(() => Profile, profile=>profile.id)
    @JoinTable()
    creator: Profile;

    @ManyToMany(() => Profile, profile=> profile.groups, {onDelete:'CASCADE'})
    @JoinTable({name:'member_group'})
    members: Profile[]
}