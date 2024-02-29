import { Exclude, Expose } from "class-transformer"

@Expose()
export class UserDto{
    
    username:string

    isActive:boolean

    createAt:Date
}
@Expose()
export class UserTokenDto extends UserDto{
    
    token:string
}