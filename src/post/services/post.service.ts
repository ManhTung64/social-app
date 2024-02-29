import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { ProfileRepository } from 'src/auth/repositories/profile.repository';
import { FileService } from 'src/file/services/file.service';
import { CreatePost, UpdatePost } from '../dtos/req/post.dto';
import { UploadFile } from 'src/file/dtos/req/file.dto.req';
import { PostContent } from '../entities/post.entity';
import { Profile } from 'src/auth/entities/user/profile.entity';
import { PaginationDto } from '../dtos/req/pagination.dto';


@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository, private readonly profileRepository: ProfileRepository,
        private readonly fileService:FileService) { }

    public async create(newPost: CreatePost, files:UploadFile[]): Promise<PostContent> {
        // check ex user
        const profile: Profile = await this.profileRepository.findOneById(newPost.userId)
        if (!profile) throw new BadRequestException()
        newPost.user = profile
        if (files.length > 0) newPost.files = await this.fileService.uploadImagesOfPost(files)
        // add new
        return await this.postRepository.createNew(newPost)
    }
    public async update(updatePost: UpdatePost): Promise<PostContent> {
        let post: PostContent = await this.postRepository.findOneById(updatePost.id)
        if (!post) throw new NotFoundException('Data is not found')
        // check ex user and permission
        const profile: Profile = await this.profileRepository.findOneById(updatePost.userId)
        if (!profile || profile.id != post.user.id) throw new BadRequestException()
        return await this.postRepository.update(post, updatePost)
    }
    public async getListPostByUser(userId:number):Promise<PostContent[]>{
        const profile: Profile = await this.profileRepository.findOneById(userId)
        if (!profile) throw new NotFoundException()

        const listPost:PostContent[] = await this.postRepository.getByUser(profile)
        if (listPost.length == 0) throw new NotFoundException()
        else return listPost
    }
    public async getPost(id:number):Promise<PostContent>{
        const post:PostContent = await this.postRepository.findOneById(id)
        if (!post) throw new NotFoundException()
        else return post
    }
    public async getAllPost():Promise<PostContent[]>{
        const post:PostContent[] = await this.postRepository.findAll()
        if (post.length == 0) throw new NotFoundException()
        else return post
    }
    public async getPostsWithPagination (pagination:PaginationDto):Promise<PostContent[]>{
        const post:PostContent[] = await this.postRepository.findWithPagination(pagination)
        if (post.length == 0) throw new NotFoundException()
        else return post
    }
}
