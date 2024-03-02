import { BaseRepository } from "../../common/repository.common"
import { Injectable } from "@nestjs/common"
import { Comment } from "../entities/comment.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, UpdateResult } from "typeorm"
import { UpdateCommentReqDto } from "../dtos/req/comment.req.dto"


@Injectable()
export class CommentRepository extends BaseRepository<Comment>{
    constructor(@InjectRepository(Comment) private commentRepository: Repository<Comment>) {
        super(commentRepository)
    }
    public async saveData(comment: Comment): Promise<Comment> {
        return await this.commentRepository.save(comment)
    }
    public async findById(id: number, isUserId:boolean, isPostId:boolean): Promise<Comment[]> {
        if (isUserId) return await this.commentRepository.find({where:{user:{id:id}}})
        else if (isPostId) return await this.commentRepository.find({where:{post:{id:id}}})
        else return await this.commentRepository.find({where:{id:id}})
    }
    public async findOneById(id: number): Promise<Comment> {
        return await this.commentRepository.findOne({ where: { id: id } })
    }
    public async update (updateComment:UpdateCommentReqDto):Promise<UpdateResult>{
        return await this.commentRepository.update(updateComment.id,{content:updateComment.content})
    }
}