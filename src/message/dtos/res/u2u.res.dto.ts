import { Exclude, Expose } from "class-transformer";
import { Profile } from "src/auth/entities/profile.entity";
import { Group } from "src/group/entities/group.entity";
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
    @Expose()
    group:Group
}
@Exclude()
export class MessageResDto extends CreateU2UMessageResDto{}