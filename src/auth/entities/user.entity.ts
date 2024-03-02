import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./profile.entity";
import { Role } from "../../common/guards/role.decorator";

@Entity({name:'users'}) // name of entity
export class User {

    @PrimaryGeneratedColumn({type:'bigint'})
    id:number

    @Column({unique:true})
    username:string

    @Column()
    password:string

    @Column({default:false})
    isActive:boolean

    @CreateDateColumn()
    createAt:Date

    @Column({default:Role.user})
    role:Role

    @OneToOne(()=>Profile,profile=>profile.id, {cascade:['update']})
    @JoinColumn()
    profile:Profile
}