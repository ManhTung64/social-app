import { Module } from '@nestjs/common';
import { ChatEventsGateway } from './gateways/chat-events.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';


@Module({
  imports:[
    AuthModule,
    MessageModule
  ],
  providers: [
    ChatEventsGateway,
  ]
})
export class EventsModule {}
