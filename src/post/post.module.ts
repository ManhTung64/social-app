import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostContent } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FileModule } from 'src/file/file.module';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { PostRepository } from './repositories/post.repository';

@Module({
    imports:[
      TypeOrmModule.forFeature([PostContent]),
      forwardRef(()=>AuthModule),
      FileModule
    ],
    controllers: [PostController],
    providers: [PostService, PostRepository]
  })
  export class PostModule {}