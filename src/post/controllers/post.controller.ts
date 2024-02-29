import { Body, Controller, Get, HttpStatus, Param, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Role, Roles } from 'src/guards/role.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePost, UpdatePost } from '../dtos/req/post.dto';
import { PostContent } from '../entities/post.entity';
import {Request, Response} from 'express'
import { CacheInterceptor } from 'src/interceptor/cache.interceptor';
import { PaginationDto } from '../dtos/req/pagination.dto';


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
        @Body() post: CreatePost,
        @Res() res: Response) {
        post.userId = req['user'].accountId
        const data: PostContent = await this.postService.create(post, files)
        res.status(HttpStatus.OK).json({ data })
    }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async update(@Req() req: Request, @Body() post: UpdatePost, @Res() res: Response) {
        post.userId = req['user'].accountId
        const data: PostContent = await this.postService.update(post)
        res.status(HttpStatus.OK).json({ data })
    }
    @Get('getbyuser/:id')
    @UseInterceptors(CacheInterceptor)
    async getByUser(@Param('id', new ParseIntPipe()) id: number, @Res() res: Response) {
        const data: PostContent[] = await this.postService.getListPostByUser(id)
        res.status(HttpStatus.OK).json({ data })
    }
    @Get(':id')
    @UseInterceptors(CacheInterceptor)
    async getPost(@Param('id', new ParseIntPipe()) id: number, @Res() res: Response) {
        const data: PostContent = await this.postService.getPost(id)
        res.status(HttpStatus.OK).json({ data })
    }
    @Get('getall')
    @UseInterceptors(CacheInterceptor)
    async getAll(@Res() res: Response) {
        const data: PostContent[] = await this.postService.getAllPost()
        res.status(HttpStatus.OK).json({ data })
    }
    @Get('getpostsforhome')
    @UseInterceptors(CacheInterceptor)
    async getForHome(@Query() pagination:PaginationDto, @Res() res: Response) {
        const data: PostContent[] = await this.postService.getPostsWithPagination(pagination)
        res.status(HttpStatus.OK).json({ data })
    }
}
