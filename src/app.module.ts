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
import { AppGateway } from './event.gateway';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    PostModule,
    GroupModule,
    MailModule,
    SchedulingModule,
    FileModule
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
