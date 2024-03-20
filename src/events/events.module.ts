import { Module } from '@nestjs/common';
import { ChatEventsGateway } from './gateways/chat-events.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';
import { GroupModule } from 'src/group/group.module';
import { ThrottleGuard } from './guards/throttle.guard';
import { BullModule } from '@nestjs/bull';
import { MessageConsumer } from './consumer/message.consumer';


@Module({
  imports:[
    AuthModule,
    MessageModule,
    GroupModule,
    BullModule.registerQueue({
      name: 'message-queue',
      prefix:'queue'
    })
  ],
  providers: [
    ChatEventsGateway,
    ThrottleGuard,
    MessageConsumer
  ]
})
export class EventsModule {
}
