import { BadRequestException, Inject, Injectable, UseFilters } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { CreateMessageReqDto, CreateU2UMessageData, DeleteMessageReqDto } from '../dtos/req/userToUserMessage.dto';
import { GroupRepository } from 'src/group/repositories/group.repository';
import { Group } from 'src/group/entities/group.entity';
import { WsException } from '@nestjs/websockets';
import { MessageEntity } from '../entities/message.entity';
import { plainToClass } from 'class-transformer';
import { CreateU2UMessageResDto, RemoveU2UMessageResDto, MessageResDto } from '../dtos/res/u2u.res.dto';
import { LimitGroupConservationReqDto, LimitGroupMessageReqDto, LimitU2UConservationReqDto, LimitU2UMessageReqDto } from '../dtos/req/pagination.dto';
import { WebSocketExceptionFilter } from 'src/socket-gateway/exception-filter/event-gateway.exception';
import { ProfileRepository } from 'src/auth/repositories/profile.repository';
import { Profile } from 'src/auth/entities/profile.entity';
import { FileService } from 'src/file/services/file.service';
import { CreateGroupMessageData, CreateGroupMessageReqDto, DeleteGroupMessageReqDto } from '../dtos/req/groupMessage.req.dto';
import { GroupMessageResDto } from '../dtos/res/group.res.dto';
import { SearchGroupMessageReqDto, SearchU2UMessageReqDto } from '../dtos/req/search.req.dto';
import { CensoredService } from './badword.service';

@Injectable()
@UseFilters(WebSocketExceptionFilter)
export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: ProfileRepository,
        private readonly groupRepository: GroupRepository,
        private readonly fileService:FileService,
        private readonly censoredService:CensoredService
    ) {
        
     }
    public async addNewU2UMessage(createMessage: CreateMessageReqDto):Promise<CreateU2UMessageResDto> {
        if (createMessage.sender == createMessage.receiver) throw new WsException("user's id is invalid")
        //check ex
        const [sender, receiver, reply]: [Profile, Profile | Group, MessageEntity] = await Promise.all([
            this.userRepository.findOneById(createMessage.sender),
            this.userRepository.findOneById(createMessage.receiver),
            ( createMessage.reply_id) ? 
                this.messageRepository.findOneById(createMessage.reply_id):null
        ])
        if (!sender || !receiver) throw new WsException("user's id is invalid")
        else if (createMessage.reply_id && !reply) throw new WsException("reply's id is invalid")
        //file
        if (createMessage.uploadFiles && createMessage.uploadFiles.length > 0) 
            createMessage.files = await this.fileService.uploadBase64File(createMessage.uploadFiles)
        // add new
        const addNewData:CreateU2UMessageData = {
            ...createMessage, 
            sender,
            receiver,
            replyTo: reply
        }
        const data:MessageEntity = await this.messageRepository.addNew(addNewData)
        if (!data) throw new WsException('bad request')
        return plainToClass(CreateU2UMessageResDto, data)
    }
    public async deleteU2UMessage(deleteMessage: DeleteMessageReqDto):Promise<RemoveU2UMessageResDto> {
        //check ex
        const [sender, thisMessage]: [Profile, MessageEntity] = await Promise.all([
            this.userRepository.findOneById(deleteMessage.sender),
            this.messageRepository.findOneById(deleteMessage.id)
        ])
        if (!sender) throw new WsException("user's id is invalid")
        else if (!thisMessage) throw new WsException("message is invalid")
        else if (thisMessage.sender.id != sender.id) throw new WsException("Forrbiden")
        // delete
        thisMessage.content = 'This content has been removed'
        thisMessage.files = []
        const data:MessageEntity = await this.messageRepository.saveChange(thisMessage)
        if (!data) throw new WsException('Bad request')
        return plainToClass(RemoveU2UMessageResDto, data)
    }
    public async getU2UMessage (req:LimitU2UMessageReqDto):Promise<MessageEntity[]>{
        if (req.sender_id == req.receiver_id) throw new WsException("user's id is invalid")
        //check ex
        const [sender, receiver]: [Profile, Profile] = await Promise.all([
            this.userRepository.findOneById(req.sender_id),
            this.userRepository.findOneById(req.receiver_id),
        ])
        if (!sender || !receiver) throw new WsException("user's id is invalid")
        return await this.messageRepository.getU2UMessage(req)
    }
    public async getU2UConservation(req:LimitU2UConservationReqDto):Promise<MessageResDto[]>{
        //check ex
        const sender:Profile =  await this.userRepository.findOneById(req.sender_id)
        if (!sender) throw new BadRequestException()

        const data:MessageEntity[] = await this.messageRepository.findListU2UConservation(req)
        let final_data:MessageResDto[] = []
        data.map((message)=>{
            final_data.push(plainToClass(MessageResDto, message))
        })
        return final_data
    }
    public async addNewGroupMessage(createMessage: CreateGroupMessageReqDto):Promise<GroupMessageResDto> {
        //check ex
        const [sender,[group, isInGroup], reply]: [Profile, [Group,boolean], MessageEntity] = await Promise.all([
            this.userRepository.findOneById(createMessage.sender),
            this.groupRepository.isMemberInGroup(createMessage.group_id, createMessage.sender),
            ( createMessage.reply_id) ? 
                this.messageRepository.findOneById(createMessage.reply_id):null
        ])
        if (!sender || !group) throw new WsException("user's or group's id is invalid")
        else if (!isInGroup) throw new WsException("Forrbiden")
        else if (createMessage.reply_id && !reply) throw new WsException("reply's id is invalid")
        // censored content
        else if (this.censoredService.badword.search(createMessage.content).length > 0) throw new WsException('Words are not polite')
        //file
        if (createMessage.uploadFiles && createMessage.uploadFiles.length > 0) 
            createMessage.files = await this.fileService.uploadBase64File(createMessage.uploadFiles)
        // add new
        const addNewData:CreateGroupMessageData = {
            ...createMessage, 
            group,
            sender,
            replyTo: reply
        }
        const data:MessageEntity = await this.messageRepository.addNew(addNewData)
        if (!data) throw new WsException('bad request')
        return plainToClass(GroupMessageResDto, data)
    }
    public async deleteGroupMessage(deleteMessage: DeleteGroupMessageReqDto):Promise<GroupMessageResDto> {
        //check ex
        const [sender, [group, isInGroup], thisMessage]: [Profile, [Group, boolean], MessageEntity] = await Promise.all([
            this.userRepository.findOneById(deleteMessage.sender),
            this.groupRepository.isMemberInGroup(deleteMessage.group_id, deleteMessage.sender),
            this.messageRepository.findOneById(deleteMessage.id)
        ])
        if (!thisMessage) throw new WsException("message is invalid")
        else if (!isInGroup || thisMessage.sender.id != deleteMessage.sender) throw new WsException("Forrbiden")
        // delete
        thisMessage.content = 'This content has been removed'
        thisMessage.files = []
        const data:MessageEntity = await this.messageRepository.saveChange(thisMessage)
        if (!data) throw new WsException('Bad request')
        return plainToClass(GroupMessageResDto, data)
    }
    public async getGroupMessage (req:LimitGroupMessageReqDto):Promise<MessageEntity[]>{
        //check ex
        const [sender, [group, isInGroup]]: [Profile, [Group, boolean]] = await Promise.all([
            this.userRepository.findOneById(req.sender_id),
            this.groupRepository.isMemberInGroup(req.group_id, req.sender_id),
        ])
        if (!sender || !group) throw new WsException("user's or group's id is invalid")
        else if (!isInGroup) throw new WsException("Forrbiden")
        return await this.messageRepository.getGroupMessage(req)
    }
    public async getGroupConservation(req:LimitGroupConservationReqDto):Promise<MessageResDto[]>{
        //check ex
        const sender:Profile =  await this.userRepository.findOneById(req.sender_id)
        if (!sender) throw new BadRequestException()
        else if (sender.groups.length == 0) return null //no group
        req.groups = sender.groups
        const data:MessageEntity[] = await this.messageRepository.findListGroupConservation(req)
        let final_data:MessageResDto[] = []
        data.map((message)=>{
            final_data.push(plainToClass(MessageResDto, message))
        })
        return final_data
    }
    public async searchU2UByKeyword(searchDto:SearchU2UMessageReqDto):Promise<MessageEntity[]>{
        return await this.messageRepository.getU2UMessageByKeyword(searchDto)
    }
    public async searchGroupByKeyword(searchDto:SearchGroupMessageReqDto):Promise<MessageEntity[]>{
        return await this.messageRepository.getGroupMessageByKeyword(searchDto)
    }
}
