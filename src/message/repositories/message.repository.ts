import { Injectable } from "@nestjs/common";
import { MessageEntity } from "../entities/message.entity";
import { BaseRepository } from "src/common/repository.common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity>{
    constructor(@InjectRepository(MessageEntity) private groupRepository: Repository<MessageEntity>) {
        super(groupRepository)
    }
    // public async createNew(newGroup: CreateGroup): Promise<Group> {
    //     return await this.groupRepository.save(this.groupRepository.create({ ...newGroup }))
    // }
    // public async findOneByName(name: string, user: Profile): Promise<Group> {
    //     return await this.groupRepository.findOne({ where: { name: name, creator: user } })
    // }
    // public async isMemberInGroup(groupId: number, memberId: number): Promise<Group> {
    //     const group:Group = await this.groupRepository.findOneOrFail({ where: { id: groupId }, relations: ['profile'] });
    //     return !!group.members.find(member => member.id === memberId) ? group:null
    // }
    // public async save(group:Group): Promise<Group> {
    //     return await this.groupRepository.save(group)
    // }
}