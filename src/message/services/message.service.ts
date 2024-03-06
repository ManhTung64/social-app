import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';

@Injectable()
export class MessageService {
    constructor(private readonly messageRepository:MessageRepository){}
    
}
