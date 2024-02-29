import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports:[
    ScheduleModule.forRoot(),
    MailModule
  ],
  providers: [SchedulingService]
})
export class SchedulingModule {}
