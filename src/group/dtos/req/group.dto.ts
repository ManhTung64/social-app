import { IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator"

export class CreateGroup{
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name:string
    @IsOptional()
    userId:number
}