// import { profile } from "console";
import { Profile } from "../../auth/entities/profile.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('group')
export class Group {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToOne(() => Profile, profile=>profile.id)
    @JoinColumn()
    creator: Profile;

    @ManyToMany(() => Profile, profile=> profile.id, {onDelete:'CASCADE'})
    @JoinTable({name:'member_group'})
    members: Profile[]
}