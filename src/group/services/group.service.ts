import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GroupRepository } from '../repositories/group.repository';
import { ProfileRepository } from '../../auth/repositories/profile.repository';
import { ChangeNameReqDto, CreateGroup } from '../dtos/req/group.dto';
import { Group } from '../entities/group.entity';
import { Profile } from '../../auth/entities/profile.entity';
import { AddMember, OutGroup, RemoveMember } from '../dtos/req/member.dto';
import { plainToClass } from 'class-transformer';
import { GroupResDto } from '../dtos/res/group.res.dto';

@Injectable()
export class GroupService {
    constructor(
        private readonly groupRepository: GroupRepository,
        private readonly profileRepository: ProfileRepository
    ) {

    }
    public async getByCreator(id: number): Promise<Group[]> {
        // check ex user
        const profile: Profile = await this.profileRepository.findOneById(id)
        if (!profile) throw new NotFoundException("Not found data")
        //add new
        return await this.groupRepository.getListByCreatorId(id)
    }
    public async changeGroupName(changeName:ChangeNameReqDto):Promise<GroupResDto>{
        const group:Group = await this.groupRepository.isCreator(changeName.group_id, changeName.creator)
        if (!group) throw new WsException('Forrbiden')
        group.name = changeName.name
        return plainToClass (GroupResDto, await this.groupRepository.saveChange(group))
    }
    public async getAllGroups(): Promise<Group[]> {
        return await this.groupRepository.findAll()
    }
    public async getUserWithListGroup(id:number):Promise<Profile>{
        return await this.profileRepository.getGroups(id)
    }
    public async create(newGroup: CreateGroup): Promise<GroupResDto> {
        // check ex user
        const profile: Profile = await this.profileRepository.findOneById(newGroup.userId)
        if (!profile) throw new NotFoundException("Not found data")
        
        //check ex group of this user
        if (await this.groupRepository.findOneByName(newGroup.name, profile)) throw new BadRequestException("Invalid group's name")
        // get
        newGroup.creator = profile
        const group:Group = await this.groupRepository.createNew(newGroup)
        profile.groups.push(plainToClass(Group, group))
        await this.profileRepository.addGroup(profile)
        return plainToClass(GroupResDto, group)
    }
    public async addMember(addMember: AddMember): Promise<Profile> {
        // check ex user
        const [profile, creator]: [Profile, Group] = await Promise.all([
            this.profileRepository.findOneById(addMember.memberId),
            this.groupRepository.isCreator(addMember.groupId, addMember.creator),
        ])
        if (!profile) throw new WsException("Not found data")
        else if (!creator) throw new WsException('Forrbiden')
        //add new
        const [group, isInGroup]: [Group, boolean] = await this.groupRepository.isMemberInGroup(addMember.groupId, addMember.memberId)
        if (isInGroup) throw new WsException('Exsited')
        group.members.push(profile)
        await this.groupRepository.saveChange(group)
        return profile
    }
    public async removeMember(removeMember: RemoveMember): Promise<Profile> {
        // check ex user
        const [profile, creator]: [Profile, Group] = await Promise.all([
            this.profileRepository.findOneById(removeMember.memberId),
            this.groupRepository.isCreator(removeMember.groupId, removeMember.creator),
        ])
        if (!profile) throw new WsException("Not found data")
        else if (!creator) throw new WsException('Forrbiden')
        //check ex of user in gr
        const [group, isInGroup]: [Group, boolean] = await this.groupRepository.isMemberInGroup(removeMember.groupId, removeMember.memberId)
        if (!isInGroup) throw new WsException('Deleted')

        group.members = group.members.filter((user) =>{return user.id != profile.id})
        await this.groupRepository.saveChange(group)
        return profile
    }
    public async outGroup(outGroup:OutGroup): Promise<Profile> {
        // check ex user
        const [profile, [group, isInGroup]]: [Profile, [Group, boolean]] = await Promise.all([
            this.profileRepository.findOneById(outGroup.memberId),
            this.groupRepository.isMemberInGroup(outGroup.groupId, outGroup.memberId),
        ])
        if (!profile) throw new WsException("Not found data")
        else if (!isInGroup) throw new WsException('Forrbiden')

        group.members = group.members.filter((user) =>{return user.id != profile.id})
        await this.groupRepository.saveChange(group)
        return profile
    }
}
