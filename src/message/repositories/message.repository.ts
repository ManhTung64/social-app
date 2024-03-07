import { Injectable } from "@nestjs/common";
import { MessageEntity } from "../entities/message.entity";
import { BaseRepository } from "src/common/repository.common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";
import { CreateU2UMessageData, CreateMessageReqDto, FindUserToUserMessageReqDto } from "../dtos/userToUserMessage.dto";
import { LimitU2UConservationReqDto, LimitU2UMessageReqDto } from "../dtos/req/pagination.dto";

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity>{
    constructor(@InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>) {
        super(messageRepository)
    }
    public async findListConservation(conditionReq:LimitU2UConservationReqDto): Promise<MessageEntity[]> {
        console.log(conditionReq)
        const listMessage: MessageEntity[] = await this.messageRepository.find({
            where: [
                { sender: { id: conditionReq.sender_id } },
                { receiver: { id: conditionReq.sender_id } }
            ],
            relations: ['sender', 'receiver', 'replyTo'],
            order: { createAt: 'DESC' },
            skip: (conditionReq.page - 1) * conditionReq.limit * 100,
            take: conditionReq.limit * 10
        })
        let listConservation: MessageEntity[] = []
        // filter to return only new message each conservation
        listMessage.map((messsage) => {
            if (listConservation.length == 0) listConservation.push(messsage)
            else listConservation.map((conservation) => {
                if ((conservation.sender.id != messsage.sender.id && conservation.receiver.id != messsage.receiver.id)
                    && (conservation.receiver.id != messsage.sender.id && conservation.sender.id != messsage.receiver.id)) listConservation.push(messsage)
            })
        })
        return listConservation
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