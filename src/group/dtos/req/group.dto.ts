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
export class ChangeNameReqDto{
    @IsOptional()
    creator:number
    @IsNotEmpty()
    @MinLength(1)
    name:string
    @IsNotEmpty()
    group_id:number
}
export class ChangeCreatorDto{
    @IsOptional()
    creator:number
    @IsNotEmpty()
    newCreator:number
    @IsNotEmpty()
    group_id:number
}