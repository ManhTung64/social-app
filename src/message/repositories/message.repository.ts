import { Injectable } from "@nestjs/common";
import { MessageEntity } from "../entities/message.entity";
import { BaseRepository } from "src/common/repository.common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateU2UMessageData, CreateMessageReqDto, FindUserToUserMessageReqDto } from "../dtos/userToUserMessage.dto";
import { skip, take } from "rxjs";
import { LimitU2UMessageReqDto } from "../dtos/req/pagination.dto";

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity>{
    constructor(@InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>) {
        super(messageRepository)
    }
    public async findListConservation(sender_id: number): Promise<MessageEntity[]> {
        return await this.messageRepository.find({
            where: [
                { sender: { id: sender_id } },
                { receiver: { id: sender_id } }
            ]
        })
    }
    public async addNew(createNewMessage: CreateU2UMessageData): Promise<MessageEntity> {
        return await this.messageRepository.save(createNewMessage)
    }
    public async findOneById(id: number): Promise<MessageEntity> {
        return await this.messageRepository.findOne({ where: { id } })
    }
    public async getU2UMessage(getMessage: LimitU2UMessageReqDto) {
        return await this.messageRepository.find({
            where: [
                {
                    sender: { id: getMessage.sender_id },
                    receiver: { id: getMessage.receiver_id }
                },
                {
                    sender: { id: getMessage.receiver_id },
                    receiver: { id: getMessage.sender_id }
                }
            ], relations: ['sender', 'receiver', 'replyTo'],
            order: { createAt: 'DESC' },
            skip: (getMessage.page - 1) * getMessage.limit,
            take: getMessage.limit
        }
        )
    }
    // public async isMemberInGroup(groupId: number, memberId: number): Promise<Group> {
    //     const group:Group = await this.groupRepository.findOneOrFail({ where: { id: groupId }, relations: ['profile'] });
    //     return !!group.members.find(member => member.id === memberId) ? group:null
    // }
    // public async save(group:Group): Promise<Group> {
    //     return await this.groupRepository.save(group)
    // }
}