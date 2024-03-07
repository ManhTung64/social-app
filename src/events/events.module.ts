import { Module } from '@nestjs/common';
import { ChatEventsGateway } from './gateways/chat-events.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';
import { GroupModule } from 'src/group/group.module';


@Module({
  imports:[
    AuthModule,
    MessageModule,
    GroupModule
  ],
  providers: [
    ChatEventsGateway,
  ]
})
export class EventsModule {}
