import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto{
    @IsNotEmpty()
    @MinLength(6)
    username:string
    @IsNotEmpty()
    @IsStrongPassword()
    password:string
}
export class LoginDto extends CreateUserDto{

}
