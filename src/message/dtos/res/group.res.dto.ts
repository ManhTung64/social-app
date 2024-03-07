import { Exclude, Expose } from "class-transformer"
import { Profile } from "passport"
import { Group } from "src/group/entities/group.entity"
import { MessageEntity } from "src/message/entities/message.entity"
import { FileInfo } from "src/post/entities/post.entity"

@Exclude()
export class GroupMessageResDto{
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
    group:Group
    @Expose()
    replyTo:MessageEntity
}