import { IsNotEmpty, IsOptional, Length } from "class-validator"

export class UserVerifyCodeDto{
    @IsNotEmpty()
    @Length(6)
    code:string
    @IsOptional()
    userId:string
}