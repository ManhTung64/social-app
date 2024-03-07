import { Inject, Injectable, UseFilters } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { CreateMessageReqDto, CreateU2UMessageData } from '../dtos/userToUserMessage.dto';
import { UserRepository } from 'src/auth/repositories/user.repository';
import { User } from 'src/auth/entities/user.entity';
import { GroupRepository } from 'src/group/repositories/group.repository';
import { Group } from 'src/group/entities/group.entity';
import { WsException } from '@nestjs/websockets';
import { MessageEntity } from '../entities/message.entity';
import { plainToClass } from 'class-transformer';
import { CreateU2UMessageResDto, U2UMessageResDto } from '../dtos/res/u2u.res.dto';
import {Redis} from 'ioredis';
import { LimitU2UConservationReqDto, LimitU2UMessageReqDto } from '../dtos/req/pagination.dto';
import { WebSocketExceptionFilter } from 'src/socket-gateway/exception-filter/event-gateway.exception';
import { ProfileRepository } from 'src/auth/repositories/profile.repository';
import { Profile } from 'src/auth/entities/profile.entity';
import { FileService } from 'src/file/services/file.service';

@Injectable()
@UseFilters(WebSocketExceptionFilter)
export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: ProfileRepository,
        private readonly groupRepository: GroupRepository,
        private readonly fileService:FileService,
        @Inject('WRITER_REDIS_CLIENT') private readonly wredisClient: Redis
    ) {
        // new Promise(()=>this.wredisClient.)
     }
    private async updateDataToRedis(){
        const messages:MessageEntity[] = await this.messageRepository.findAll()
    } 
    public async getListConservation(): Promise<any> {

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
        if (createMessage.uploadFiles.length > 0) 
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
    public async getU2UMessage (req:LimitU2UMessageReqDto):Promise<MessageEntity[]>{
        if (req.sender_id == req.receiver_id) throw new WsException("user's id is invalid")
        console.log(req)
        //check ex
        const [sender, receiver]: [Profile, Profile] = await Promise.all([
            this.userRepository.findOneById(req.sender_id),
            this.userRepository.findOneById(req.receiver_id),
        ])
        if (!sender || !receiver) throw new WsException("user's id is invalid")
        return await this.messageRepository.getU2UMessage(req)
    }
    public async getU2UConservation(req:LimitU2UConservationReqDto):Promise<U2UMessageResDto[]>{
        //check ex
        const sender:Profile =  await this.userRepository.findOneById(req.sender_id)
        if (!sender) throw new WsException("user's id is invalid")

        const data:MessageEntity[] = await this.messageRepository.findListConservation(req)
        let final_data:U2UMessageResDto[] = []
        data.map((message)=>{
            final_data.push(plainToClass(U2UMessageResDto, message))
        })
        return final_data
    }
}
