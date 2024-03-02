import { BadRequestException, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GroupRepository } from '../repositories/group.repository';
import { ProfileRepository } from '../../auth/repositories/profile.repository';
import { CreateGroup } from '../dtos/req/group.dto';
import { Group } from '../entities/group.entity';
import { Profile } from '../../auth/entities/profile.entity';
import { AddMember, RemoveMember } from '../dtos/req/member.dto';

@Injectable()
export class GroupService {
    constructor(private readonly groupRepository:GroupRepository, private readonly profileRepository:ProfileRepository){

    }
    public async create (newGroup:CreateGroup):Promise<Group>{
        // check ex user
        const profile:Profile = await this.profileRepository.findOneById(newGroup.userId)
        if (!profile) throw new WsException("Not found data")
        //check ex group of this user
        if (await this.groupRepository.findOneByName(newGroup.name,profile)) throw new WsException("Invalid group's name")
        //add new
        return await this.groupRepository.createNew(newGroup)
    }
    public async addMember (addMember:AddMember):Promise<boolean>{
        // check ex user
        const profile:Profile = await this.profileRepository.findOneById(addMember.memberId)
        if (!profile) throw new WsException("Not found data")
        //add new
        const group:Group = await this.groupRepository.isMemberInGroup(addMember.groupId,addMember.memberId)
        if (group) return false
        group.members.push(profile)
        profile.groups.push(group)
        await Promise.all([
            this.groupRepository.save(group),
            this.profileRepository.addGroup(profile)
        ])
        return true
    }
    public async removeMember (removeMember:RemoveMember){
        // check ex user
        const profile:Profile = await this.profileRepository.findOneById(removeMember.memberId)
        if (!profile) throw new WsException("Not found data")
        //check ex of user in gr
        const group:Group = await this.groupRepository.isMemberInGroup(removeMember.groupId,removeMember.memberId)
        if (!group) return false

        group.members.filter((user)=>user.id !== removeMember.memberId)
        await this.groupRepository.save(group)
        return true
    }
}
