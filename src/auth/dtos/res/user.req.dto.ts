import { Exclude, Expose } from "class-transformer"

@Exclude()
export class UserDto{
    @Expose()
    username:string
    @Expose()
    isActive:boolean
    @Expose()
    createAt:Date
}
@Exclude()
export class UserTokenDto extends UserDto{
    @Expose()
    token:string
}