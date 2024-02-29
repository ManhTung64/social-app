import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CommentRepository } from "../repositories/comment.repository";
import { ProfileRepository } from "src/auth/repositories/profile.repository";
import { UserRepository } from "src/auth/repositories/user.repository";
import { CommentResDto } from "../dtos/res/comment.res.dto";
import { CreateCommentReqDto, DeleteCommentReqDto, UpdateCommentReqDto } from "../dtos/req/comment.req.dto";
import { PostRepository } from "../repositories/post.repository";
import { Comment } from "../entities/comment.entity";
import { plainToClass } from "class-transformer";

@Injectable()
export class CommentService {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly userRepository:UserRepository,
        private readonly postRepostiory:PostRepository
    ) { }
    public async addNew (newComment:CreateCommentReqDto):Promise<CommentResDto>{
        //valid foreign key
        const [validUser,validPost] = await Promise.all([
            this.userRepository.findOneById(newComment.userId),
            this.postRepostiory.findOneById(newComment.postId)
        ])
        if (!validUser || !validPost) throw new BadRequestException()
        //check bad word

        // create new comment
        const comment:Comment = plainToClass(Comment,newComment)
        comment.user = validUser.profile
        comment.post = validPost
        return plainToClass(CommentResDto,await this.commentRepository.saveData(comment))
    }
    public async update (updateComment:UpdateCommentReqDto):Promise<CommentResDto>{
        //Check ex
        const [validUser,validComment] = await Promise.all([
            this.userRepository.findOneById(updateComment.userId),
            this.commentRepository.findOneById(updateComment.id)
        ])
        if (!validUser || !validComment) throw new BadRequestException()
        else if (validComment.user.id != validUser.profile.id) throw new ForbiddenException()

        return plainToClass(CommentResDto, await this.commentRepository.update(updateComment))
    }
    public async delete (deleteComment:DeleteCommentReqDto):Promise<CommentResDto>{
        //Check ex
        const [validUser,validComment] = await Promise.all([
            this.userRepository.findOneById(deleteComment.userId),
            this.commentRepository.findOneById(deleteComment.id)
        ])
        if (!validUser || !validComment) throw new BadRequestException()
        else if (validComment.user.id != validUser.profile.id) throw new ForbiddenException()

        return plainToClass(CommentResDto, await this.commentRepository.delete(validComment.id))
    }
}