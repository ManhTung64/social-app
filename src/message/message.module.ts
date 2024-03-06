import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repositories/message.repository';
import { AuthModule } from 'src/auth/auth.module';
import { GroupModule } from 'src/group/group.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import Redis from 'ioredis';
import redisConfig from 'src/configuration/redis.config';

@Module({
  imports:[
    TypeOrmModule.forFeature([MessageEntity]),
    AuthModule,
    GroupModule,
  ],
  providers: [
    MessageService,
    MessageRepository,
    {
      provide: 'WRITER_REDIS_CLIENT',
      useFactory: (): Redis => {
        return new Redis(redisConfig);
      },
    },
  ],
  exports:[
    MessageService
  ]
})
export class MessageModule {}
