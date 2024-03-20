import { IsNotEmpty, IsOptional } from "class-validator"

export class PinU2UMessageReqDto{
    @IsOptional()
    sender_id:number
    @IsNotEmpty()
    message_id:string
}
export class UnPinU2UMessageReqDto{
    @IsNotEmpty()
    id:number
    @IsOptional()
    sender_id:number
}
export class PinU2UConservationReqDto{
    @IsOptional()
    sender_id:number
    @IsNotEmpty()
    receiver_id:number
}
export class PinGroupMessageReqDto{
    @IsOptional()
    creator:number
    @IsNotEmpty()
    message_id:string
}
export class UnPinGroupMessageReqDto{
    @IsNotEmpty()
    id:number
    @IsOptional()
    creator_id:number
}
export class PinGroupConservationReqDto{
    @IsOptional()
    user_id:number
    @IsNotEmpty()
    group_id:number
}