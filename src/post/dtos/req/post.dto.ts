import { IsNotEmpty, IsOptional, MinLength } from "class-validator"
import { Profile } from "src/auth/entities/user/profile.entity"
import { FileInfo } from "src/post/entities/post.entity"

export class CreatePost{
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

export class UpdatePost{
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