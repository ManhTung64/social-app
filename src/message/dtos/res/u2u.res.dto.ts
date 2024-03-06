import { Exclude, Expose } from "class-transformer";
import { Profile } from "src/auth/entities/profile.entity";
import { MessageEntity } from "src/message/entities/message.entity";
import { FileInfo } from "src/post/entities/post.entity";

@Exclude()
export class CreateU2UMessageResDto{
    @Expose()
    id:number
    @Expose()
    content:string
    @Expose()
    createAt:Date
    @Expose()
    files:FileInfo[]
    @Expose()
    sender:Profile
    @Expose()
    receiver:Profile
    @Expose()
    replyTo:MessageEntity
}