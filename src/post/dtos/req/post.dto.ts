import { IsNotEmpty, IsOptional, MinLength } from "class-validator"
import { Profile } from "../../../auth/entities/profile.entity"
import { FileInfo } from "../../../post/entities/post.entity"

export class CreatePostReqDto{
    @IsNotEmpty()
    @MinLength(1)
    title:string
    @IsNotEmpty()
    content:string
    @IsOptional()
    userId:number
    @IsOptional()
    user:Profile
    @IsOptional()
    files: FileInfo[]
}

export class UpdatePostReqDto{
    @IsOptional()
    @MinLength(1)
    title:string
    @IsOptional()
    content:string
    @IsOptional()
    userId:number
    @IsNotEmpty()
    id:number
}