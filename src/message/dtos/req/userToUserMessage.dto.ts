import { IsNotEmpty, IsOptional } from "class-validator";
import { Profile } from "src/auth/entities/profile.entity";
import { FileInfo } from "src/post/entities/post.entity";
import { MessageEntity } from "../../entities/message.entity";
import { Group } from "src/group/entities/group.entity";
import { ValidateContent } from "src/message/decorators/validateContent.decorator";

export class FindUserToUserMessageReqDto{
    @IsNotEmpty()
    sender:number
    @IsNotEmpty()
    receiver:number
}
export class CreateMessageReqDto{
    @IsOptional()
    sender:number
    @IsNotEmpty()
    receiver:number
    @ValidateContent()
    content:string
    @IsOptional()
    reply_id: string
    @IsOptional()
    files:FileInfo[]
    @IsOptional()
    uploadFiles:string[]
}
export class DeleteMessageReqDto{
    @IsOptional()
    sender:number
    @IsNotEmpty()
    id:string
}
export class CreateU2UMessageData{
    sender:Profile
    receiver:Profile
    content:string
    replyTo?: MessageEntity
    files?:FileInfo[]
}