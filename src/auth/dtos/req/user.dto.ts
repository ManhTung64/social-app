import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @MinLength(6)
    username: string
    @IsNotEmpty()
    @IsStrongPassword()
    password: string
}
export class CreateUserAppDto {
    @IsNotEmpty()
    @MinLength(6)
    username: string
    @IsNotEmpty()
    name:string
    @IsNotEmpty()
    avatar:string
}
export class LoginDto extends CreateUserDto {

}
export class LoginWithGoogleReqDto {
    @IsNotEmpty()
    @IsEmail()
    email: string
    @IsNotEmpty()
    firstName: string
    @IsNotEmpty()
    lastName: string
    @IsNotEmpty()
    picture: string
    @IsNotEmpty()
    accessToken: string
}