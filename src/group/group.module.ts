import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { AuthModule } from '../auth/auth.module';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';
import { GroupRepository } from './repositories/group.repository';
import { MessageModule } from 'src/message/message.module';

@Module({
    imports:[
      TypeOrmModule.forFeature([Group]),
      AuthModule,
      forwardRef(()=>MessageModule)
    ],
    controllers: [GroupController],
    providers: [GroupService, GroupRepository],
    exports:[GroupService, GroupRepository]
  })
  export class GroupModule {}
