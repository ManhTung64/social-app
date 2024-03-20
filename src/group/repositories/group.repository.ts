import { BaseRepository } from "../../common/repository.common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Group } from "../entities/group.entity";
import { CreateGroup } from "../dtos/req/group.dto";
import { Profile } from "../../auth/entities/profile.entity";

@Injectable()
export class GroupRepository extends BaseRepository<Group>{
    constructor(@InjectRepository(Group) private groupRepository: Repository<Group>) {
        super(groupRepository)
    }
    public async createNew(newGroup: CreateGroup): Promise<Group> {
        return await this.groupRepository.save({ ...newGroup, creator: newGroup.creator })
    }
    public async getListByCreatorId(id: number): Promise<Group[]> {
        return await this.groupRepository.find({ where: { creator: { id: id } } })
    }
    public async findOneByName(name: string, user: Profile): Promise<Group> {
        return await this.groupRepository.findOne({ where: { name: name, creator: user } })
    }
    public async isMemberInGroup(groupId: number, memberId: number): Promise<[Group, boolean]> {
        const group: Group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['members','creator'] });
        return group.members.find(member => member.id == memberId) ? [group, true] : [group, false]
    }
    public async isCreator(groupId: number, creator: number): Promise<Group> {
        return await this.groupRepository.findOne({
            where:
            {
                id: groupId,
                creator: { id: creator }
            }
        })
    }
}