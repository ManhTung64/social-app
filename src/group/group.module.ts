import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { AuthModule } from '../auth/auth.module';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';
import { GroupRepository } from './repositories/group.repository';

@Module({
    imports:[
      TypeOrmModule.forFeature([Group]),
      AuthModule
    ],
    controllers: [GroupController],
    providers: [GroupService, GroupRepository],
    exports:[GroupService, GroupRepository]
  })
  export class GroupModule {}
