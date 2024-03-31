import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repositories/message.repository';
import { AuthModule } from 'src/auth/auth.module';
import { GroupModule } from 'src/group/group.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { MessageController } from './controllers/message.controller';
import { FileModule } from 'src/file/file.module';
import { PinMessageEntity } from './entities/pin.entity';
import { PinMessageService } from './services/pin.service';
import { PinMessageRepository } from './repositories/pin.repository';
import { CensoredService } from './services/badword.service';
import { ContentValidator } from './decorators/validateContent.decorator';

@Module({
  imports:[
    TypeOrmModule.forFeature([MessageEntity, PinMessageEntity]),
    AuthModule,
    forwardRef(()=> GroupModule),
    FileModule
  ],
  controllers:[
    MessageController
  ],
  providers: [
    MessageService,
    MessageRepository,
    PinMessageService,
    PinMessageRepository,
    CensoredService,
    ContentValidator
  ],
  exports:[
    MessageService,
    PinMessageService,
    MessageRepository
  ]
})
export class MessageModule {}
