import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSourceOptions } from './app/postgres/data-source';
import { PostModule } from './post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupModule } from './group/group.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { AppGateway } from './socket-gateway/event.gateway';
import { EventsModule } from './events/events.module';
import redisConfig from './configuration/redis.config'
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async () => ({
        redis: redisConfig,
      }),
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    PostModule,
    GroupModule,
    MailModule,
    SchedulingModule,
    FileModule,AppGateway, EventsModule, MessageModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
