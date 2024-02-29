import { IsNotEmpty, IsOptional } from "class-validator"

export class CreateCommentReqDto{
    @IsNotEmpty()
    postId:number
    @IsOptional()
    userId:number
    @IsNotEmpty()
    content:string
}
export class UpdateCommentReqDto{
    @IsNotEmpty()
    id:number
    @IsOptional()
    userId:number
    @IsNotEmpty()
    content:string
}
export class DeleteCommentReqDto{
    @IsNotEmpty()
    id:number
    @IsOptional()
    userId:number
}