import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';

@Module({
  providers: [MessageService]
})
export class MessageModule {}
