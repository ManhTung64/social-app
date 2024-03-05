import { Module } from '@nestjs/common';
import { StateEventsGateway } from './gateways/state-events.gateway';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports:[
    AuthModule
  ],
  providers: [
    StateEventsGateway,
  ]
})
export class EventsModule {}
