import { Injectable, UseFilters } from "@nestjs/common";
import { PinMessageRepository } from "../repositories/pin.repository";
import { MessageRepository } from "../repositories/message.repository";
import { PinGroupConservationReqDto, PinGroupMessageReqDto, PinU2UConservationReqDto, PinU2UMessageReqDto, UnPinGroupMessageReqDto, UnPinU2UMessageReqDto } from "../dtos/req/pin.req.dto";
import { MessageEntity } from "../entities/message.entity";
import { WebSocketExceptionFilter } from "src/events/exception-filter/event-gateway.exception";
import { WsException } from "@nestjs/websockets";
import { PinMessageEntity } from "../entities/pin.entity";
import { plainToClass } from "class-transformer";
import { PinGroupMessageResDto, PinU2UMessageResDto } from "../dtos/res/pin.res.dto";
import { UserRepository } from "src/auth/repositories/user.repository";
import { GroupRepository } from "src/group/repositories/group.repository";
import { Group } from "src/group/entities/group.entity";

@Injectable()
@UseFilters(WebSocketExceptionFilter)
export class PinMessageService {
    constructor(
        private readonly pinRepository: PinMessageRepository,
        private readonly messageRepository: MessageRepository,
        private readonly userRepository:UserRepository,
        private readonly groupRepository:GroupRepository
    ) { }

    public async getAllPinMessageOfU2Uconservation(conservation:PinU2UConservationReqDto):Promise<PinMessageEntity[ ]>{
        // check ex
        const [sender, receiver] = await Promise.all([
            this.userRepository.findOneById(conservation.sender_id),
            this.userRepository.findOneById(conservation.receiver_id)
        ])
        if (!sender || !receiver) throw new WsException('bad request')
        return await this.pinRepository.getListPinMessageBySenderIdOrReceiverId(conservation)
    }
    public async pinU2UMessage(pinMessage: PinU2UMessageReqDto): Promise<PinU2UMessageResDto> {
        // check valid
        const [message, isEx]: [MessageEntity, PinMessageEntity] = await Promise.all([
            this.messageRepository.findOneById(pinMessage.message_id),
            this.pinRepository.findOneByMessageId(pinMessage.message_id)
        ]) 
        if (!message || isEx) throw new WsException('message is invalid or pinned')
        else if (pinMessage.sender_id != message.sender.id
            || pinMessage.sender_id != message.receiver.id)  throw new WsException('Forrbiden')
        // add new
        const newPinMessage:PinMessageEntity = await this.pinRepository.saveChange({
            message:message
        })
        if (!newPinMessage) throw new WsException('Bad request')
        const res:PinU2UMessageResDto = plainToClass(PinU2UMessageResDto, message)
        res.pin_id = newPinMessage.id
        return res
    }
    public async unPinU2UMessage(unPinMessage: UnPinU2UMessageReqDto): Promise<PinU2UMessageResDto> {
        // check valid
        const pinMessage:PinMessageEntity = await this.pinRepository.findOneById(unPinMessage.id)
        if (!pinMessage) throw new WsException('message is un-pinned')
        else if (unPinMessage.sender_id != pinMessage.message.sender.id
            || unPinMessage.sender_id != pinMessage.message.receiver.id)  throw new WsException('Forrbiden')
        // remove
        const res_unPinMessage:PinMessageEntity = await this.pinRepository.delete(pinMessage.id)
        if (!res_unPinMessage) throw new WsException('Bad request')
        const res:PinU2UMessageResDto = plainToClass(PinU2UMessageResDto, res_unPinMessage)
        res.pin_id = res_unPinMessage.id
        return res
    }
    public async getAllPinMessageOfGroupconservation(group_conservation:PinGroupConservationReqDto):Promise<PinMessageEntity[ ]>{
        // check ex
        const [group, isInGroup]:[Group, boolean] = await this.groupRepository
                                            .isMemberInGroup(group_conservation.group_id, group_conservation.user_id)
        if (!group) throw new WsException('bad request')
        else if (!isInGroup) throw new WsException('Forrbiden')
        return await this.pinRepository.getListPinMessageByGroupId(group_conservation)
    }
    public async pinGroupMessage(pinMessage: PinGroupMessageReqDto): Promise<PinGroupMessageResDto> {
        // check valid
        const [message, isEx]:[MessageEntity,PinMessageEntity] = await Promise.all([
            this.messageRepository.findOneById(pinMessage.message_id),
            this.pinRepository.findOneByMessageId(pinMessage.message_id)
        ]) 

        if (!message || isEx) throw new WsException('message is invalid or pinned')
        else if (message.group.creator.id != pinMessage.creator)  throw new WsException('Forrbiden')
        // add new
        const newPinMessage:PinMessageEntity = await this.pinRepository.saveChange({
            message:message
        })
        if (!newPinMessage) throw new WsException('Bad request')
        const res:PinGroupMessageResDto = plainToClass(PinGroupMessageResDto, message)
        res.pin_id = newPinMessage.id
        return res
    }
    public async unPinGroupMessage(unPinMessage: UnPinGroupMessageReqDto): Promise<PinGroupMessageResDto> {
        // check valid
        const pinMessage:PinMessageEntity = await this.pinRepository.findOneById(unPinMessage.id)
        if (!pinMessage) throw new WsException('message is un-pinned')
        else if (unPinMessage.creator_id != pinMessage.message.group.creator.id)  throw new WsException('Forrbiden')
        // remove
        const res_unPinMessage:PinMessageEntity = await this.pinRepository.delete(pinMessage.id)
        if (!res_unPinMessage) throw new WsException('Bad request')
        const res:PinGroupMessageResDto = plainToClass(PinGroupMessageResDto, res_unPinMessage)
        res.pin_id = res_unPinMessage.id
        return res
    }
}