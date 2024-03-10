import { IsNotEmpty, IsOptional } from "class-validator"
import { Profile } from "src/auth/entities/profile.entity"
import { Group } from "src/group/entities/group.entity"
import { MessageEntity } from "src/message/entities/message.entity"
import { FileInfo } from "src/post/entities/post.entity"
import { DeleteMessageReqDto } from "./userToUserMessage.dto"

export class CreateGroupMessageReqDto{
    @IsOptional()
    sender:number
    @IsNotEmpty()
    content:string
    @IsNotEmpty()
    group_id:number
    @IsOptional()
    reply_id: number
    @IsOptional()
    files:FileInfo[]
    @IsOptional()
    uploadFiles:string[]
}
export class CreateGroupMessageData{
    @IsOptional()
    sender:Profile
    @IsNotEmpty()
    content:string
    @IsNotEmpty()
    group:Group
    @IsOptional()
    replyTo: MessageEntity
    @IsOptional()
    files:FileInfo[]
}
export class DeleteGroupMessageReqDto extends DeleteMessageReqDto{
    @IsNotEmpty()
    group_id:number
}