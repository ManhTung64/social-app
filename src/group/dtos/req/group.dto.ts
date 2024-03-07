import { IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator"
import { Profile } from "src/auth/entities/profile.entity"

export class CreateGroup{
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name:string
    @IsOptional()
    userId:number
    @IsOptional()
    creator:Profile
}