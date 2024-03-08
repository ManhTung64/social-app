import { IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";
import { Profile } from "src/auth/entities/profile.entity";
import { Group } from "src/group/entities/group.entity";

class LimitMessageReqDto {
    private MIN_PAGE:number = 1
    private MIN_LIMIT:number = 10
    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = this.MIN_PAGE;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit: number = this.MIN_LIMIT;
}

export class LimitU2UConservationReqDto extends LimitMessageReqDto{
    @IsOptional()
    sender_id: number
}
export class LimitU2UMessageReqDto extends LimitMessageReqDto{
    @IsOptional()
    sender_id:number
    @IsNotEmpty()
    receiver_id:number
    @IsOptional()
    sender:Profile
    @IsOptional()
    receiver:Profile
}
export class LimitGroupMessageReqDto extends LimitMessageReqDto{
    @IsOptional()
    sender_id:number
    @IsNotEmpty()
    group_id:number
}
export class LimitGroupConservationReqDto extends LimitU2UConservationReqDto{
    groups:Group[]
}