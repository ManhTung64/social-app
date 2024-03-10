import { Injectable } from "@nestjs/common";
import { MessageEntity } from "../entities/message.entity";
import { BaseRepository } from "src/common/repository.common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThanOrEqual, Repository } from "typeorm";
import { CreateU2UMessageData, CreateMessageReqDto, FindUserToUserMessageReqDto } from "../dtos/req/userToUserMessage.dto";
import { LimitGroupConservationReqDto, LimitGroupMessageReqDto, LimitU2UConservationReqDto, LimitU2UMessageReqDto } from "../dtos/req/pagination.dto";
import { CreateGroupMessageData } from "../dtos/req/groupMessage.req.dto";

@Injectable()
export class MessageRepository extends BaseRepository<MessageEntity>{
    constructor(@InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>) {
        super(messageRepository)
    }
    public async findListU2UConservation(conditionReq: LimitU2UConservationReqDto): Promise<MessageEntity[]> {
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
            else if (!listConservation.filter((conservation) => {
                return ((conservation.sender.id == messsage.sender.id && conservation.receiver.id == messsage.receiver.id)
                    && (conservation.receiver.id == messsage.sender.id && conservation.sender.id == messsage.receiver.id))
            })
            ) listConservation.push(messsage)
        })
        return listConservation
    }
    public async findListGroupConservation(conditionReq: LimitGroupConservationReqDto): Promise<MessageEntity[]> {
        const listMessage: MessageEntity[] = await this.messageRepository.find({
            where: {
                group: { id: In(conditionReq.groups.map(group => group.id)), }
            },
            relations: ['sender', 'replyTo', 'group'],
            order: { createAt: 'DESC' },
            skip: (conditionReq.page - 1) * conditionReq.limit * 100,
            take: conditionReq.limit * 10
        })
        let listConservation: MessageEntity[] = []
        // filter to return only new message each conservation
        listMessage.map((messsage) => {
            if (listConservation.length == 0) listConservation.push(messsage)
            else if (!listConservation.find((conservation) => { return messsage.group.id == conservation.group.id }))
                listConservation.push(messsage)
        })
        return listConservation
    }
    public async addNew(createNewMessage: CreateU2UMessageData | CreateGroupMessageData): Promise<MessageEntity> {
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
    public async getGroupMessage(getMessage: LimitGroupMessageReqDto) {
        return await this.messageRepository.find({
            where:
            {
                group: { id: getMessage.group_id }
            },
            relations: ['sender', 'group', 'replyTo'],
            order: { createAt: 'DESC' },
            skip: (getMessage.page - 1) * getMessage.limit,
            take: getMessage.limit
        }
        )
    }
    public async saveChange(message:MessageEntity):Promise<MessageEntity>{
        return await this.messageRepository.save(message)
    }
}