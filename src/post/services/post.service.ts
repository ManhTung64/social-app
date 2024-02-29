import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { ProfileRepository } from 'src/auth/repositories/profile.repository';
import { FileService } from 'src/file/services/file.service';
import { CreatePostReqDto, UpdatePostReqDto } from '../dtos/req/post.dto';
import { UploadFile } from 'src/file/dtos/req/file.dto.req';
import { PostContent } from '../entities/post.entity';
import { Profile } from 'src/auth/entities/user/profile.entity';
import { PaginationReqDto } from '../dtos/req/pagination.dto';
import { PostResDto } from '../dtos/res/post.res.dto';
import { plainToClass } from 'class-transformer';


@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository, private readonly profileRepository: ProfileRepository,
        private readonly fileService: FileService) { }

    public async create(newPost: CreatePostReqDto, files: UploadFile[]): Promise<PostResDto> {
        // check ex user
        const profile: Profile = await this.profileRepository.findOneById(newPost.userId)
        if (!profile) throw new BadRequestException()
        newPost.user = profile
        if (files.length > 0) newPost.files = await this.fileService.uploadImagesOfPost(files)
        // add new
        return plainToClass(PostResDto, await this.postRepository.createNew(newPost))
    }
    public async update(updatePost: UpdatePostReqDto): Promise<PostResDto> {
        let post: PostContent = await this.postRepository.findOneById(updatePost.id)
        if (!post) throw new NotFoundException('Data is not found')
        // check ex user and permission
        const profile: Profile = await this.profileRepository.findOneById(updatePost.userId)
        if (!profile || profile.id != post.user.id) throw new BadRequestException()
        return plainToClass(PostResDto, await this.postRepository.update(post, updatePost))
    }
    public async getListPostByUser(userId: number): Promise<PostResDto[]> {
        const profile: Profile = await this.profileRepository.findOneById(userId)
        if (!profile) throw new NotFoundException()

        const listPost: PostContent[] = await this.postRepository.getByUser(profile)

        if (listPost.length == 0) throw new NotFoundException()
        else return listPost.map(post => plainToClass(PostResDto, post));
    }
    public async getPost(id: number): Promise<PostResDto> {
        const post: PostContent = await this.postRepository.findOneById(id)
        if (!post) throw new NotFoundException()
        else return plainToClass(PostResDto, post)
    }
    public async getAllPost(): Promise<PostResDto[]> {
        const posts: PostContent[] = await this.postRepository.findAll()
        if (posts.length == 0) throw new NotFoundException()
        else return posts.map(post => plainToClass(PostResDto, post));
    }
    public async getPostsWithPagination(pagination: PaginationReqDto): Promise<PostResDto[]> {
        const posts: PostContent[] = await this.postRepository.findWithPagination(pagination)
        if (posts.length == 0) throw new NotFoundException()
        else return posts.map(post => plainToClass(PostResDto, post));
    }
}
