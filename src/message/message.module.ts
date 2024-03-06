import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  providers: [
    MessageService,
    MessageRepository
  ]
})
export class MessageModule {}
