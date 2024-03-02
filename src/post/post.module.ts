import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostContent } from './entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { PostRepository } from './repositories/post.repository';
import { Comment } from './entities/comment.entity';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { CommentRepository } from './repositories/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostContent, Comment]),
    forwardRef(() => AuthModule),
    FileModule
  ],
  controllers: [
    PostController,
    CommentController
  ],
  providers: [
    PostService,
    PostRepository,
    CommentService,
    CommentRepository,
  ],
  exports:[PostRepository]
})
export class PostModule { }