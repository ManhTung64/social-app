import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { AuthenticationGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Role, Roles } from '../../common/guards/role.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostReqDto, UpdatePostReqDto } from '../dtos/req/post.dto';
import { PostContent } from '../entities/post.entity';
import {Request, Response} from 'express'
import { CacheInterceptor } from '../../common/interceptor/cache.interceptor';
import { PaginationReqDto } from '../dtos/req/pagination.dto';
import { PostResDto } from '../dtos/res/post.res.dto';


@Controller('api/post')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post('create')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    @UseInterceptors(FilesInterceptor('files', 4))
    async create(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({ maxSize: 100000 })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) files: Express.Multer.File[],
        @Req() req: Request,
        @Body() post: CreatePostReqDto) {
        post.userId = req['auth'].accountId
        return await this.postService.create(post, files)
    }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async update(
        @Req() req: Request, 
        @Body() post: UpdatePostReqDto) {
        post.userId = req['auth'].accountId
        return await this.postService.update(post)
    }
    @Get('getbyuser/:id')
    @UseInterceptors(CacheInterceptor)
    async getByUser(
        @Param('id', new ParseIntPipe()) id: number) {
        return await this.postService.getListPostByUser(id)
    }
    @Get('get/:id')
    @UseInterceptors(CacheInterceptor)
    async getPost(
        @Param('id', new ParseIntPipe()) id: number) {
            return await this.postService.getPost(id)
    }
    @Get('/getall')
    @UseInterceptors(CacheInterceptor)
    async getAll() {
        return await this.postService.getAllPost()
    }
    @Get('getpostsforhome')
    @UseInterceptors(CacheInterceptor)
    async getForHome(@Query() pagination:PaginationReqDto) {
        return await this.postService.getPostsWithPagination(pagination)
    }
}
