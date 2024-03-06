import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { CreateMessageReqDto, CreateU2UMessageData } from '../dtos/userToUserMessage.dto';
import { UserRepository } from 'src/auth/repositories/user.repository';
import { User } from 'src/auth/entities/user.entity';
import { GroupRepository } from 'src/group/repositories/group.repository';
import { Group } from 'src/group/entities/group.entity';
import { WsException } from '@nestjs/websockets';
import { MessageEntity } from '../entities/message.entity';
import { plainToClass } from 'class-transformer';
import { CreateU2UMessageResDto } from '../dtos/res/u2u.res.dto';

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: UserRepository,
        private readonly groupRepository: GroupRepository
    ) { }

    public async getListConservation(): Promise<any> {

    }
    public async addNewU2UMessage(createMessage: CreateMessageReqDto):Promise<CreateU2UMessageResDto> {
        if (createMessage.sender == createMessage.receiver) throw new WsException("user's id is invalid")
        //check ex
        const [sender, receiver, reply]: [User, User | Group, MessageEntity] = await Promise.all([
            this.userRepository.findOneById(createMessage.sender),
            this.userRepository.findOneById(createMessage.receiver),
            // (createMessage.group) ?
            //     this.userRepository.findOneById(createMessage.receiver) :
            //     this.groupRepository.isMemberInGroup(createMessage.group, createMessage.sender),
            ( createMessage.reply_id) ? 
                this.messageRepository.findOneById(createMessage.reply_id):null
        ])
        if (createMessage.reply_id && !reply) throw new WsException("reply's id is invalid")
        //file

        // add new
        const addNewData:CreateU2UMessageData = {
            ...createMessage, 
            sender:sender.profile,
            receiver:receiver.profile,
            replyTo: reply
        }
        return plainToClass(CreateU2UMessageResDto, await this.messageRepository.addNew(addNewData))
    }
}
