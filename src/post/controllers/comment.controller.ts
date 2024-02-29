import { Body, Controller, Delete, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CommentService } from "../services/comment.service";
import { Request, Response } from "express"; 
import { CreateCommentReqDto, DeleteCommentReqDto, UpdateCommentReqDto } from "../dtos/req/comment.req.dto";
import { AuthenticationGuard } from "src/guards/auth.guard";
import { RolesGuard } from "src/guards/role.guard";
import { Role, Roles } from "src/guards/role.decorator";
import { CommentResDto } from "../dtos/res/comment.res.dto";


@Controller('api/post/comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post('create')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async addNew(
        @Req() req: Request,
        @Body() body: CreateCommentReqDto,
        @Res() res: Response
    ){
        body.userId = req['user'].userId
        const data:CommentResDto = await this.commentService.addNew(body)
        return res.status(HttpStatus.CREATED).json({data})
    }
    @Patch('update')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async update(
        @Req() req: Request,
        @Body() body: UpdateCommentReqDto,
        @Res() res: Response
    ){
        body.userId = req['user'].userId
        const data:CommentResDto = await this.commentService.update(body)
        return res.status(HttpStatus.OK).json({data})
    }
    @Delete(':id')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    async delete(
        @Req() req: Request,
        @Param('id', new ParseIntPipe()) id:number,
        @Res() res: Response
    ){
        const deleteReq:DeleteCommentReqDto = {id,userId:req['user'].userId}
        const data:CommentResDto = await this.commentService.delete(deleteReq)
        return res.status(HttpStatus.OK).json({data})
    }
}