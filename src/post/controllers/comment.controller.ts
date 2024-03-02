import { Body, Controller, Delete, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CommentService } from "../services/comment.service";
import { Request, Response } from "express"; 
import { CreateCommentReqDto, DeleteCommentReqDto, UpdateCommentReqDto } from "../dtos/req/comment.req.dto";
import { AuthenticationGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Role, Roles } from "../../common/guards/role.decorator";
import { CommentResDto } from "../dtos/res/comment.res.dto";


@Controller('api/post/comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post('create')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async addNew(
        @Req() req: Request,
        @Body() body: CreateCommentReqDto
    ){
        body.userId = req['user'].userId
        return await this.commentService.addNew(body)
    }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async update(
        @Req() req: Request,
        @Body() body: UpdateCommentReqDto
    ){
        body.userId = req['user'].userId
        return await this.commentService.update(body)
    }
    @Delete(':id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async delete(
        @Req() req: Request,
        @Param('id', new ParseIntPipe()) id:number
    ){
        const deleteReq:DeleteCommentReqDto = {id,userId:req['user'].userId}
        return await this.commentService.delete(deleteReq)
    }
}