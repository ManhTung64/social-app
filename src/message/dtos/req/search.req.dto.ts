import { IsNotEmpty, IsOptional, MinLength} from "class-validator"
import { PaginationReqDto } from "src/post/dtos/req/pagination.dto"

class SearchMessageReqDto extends PaginationReqDto{
    @IsNotEmpty()
    @MinLength(1)
    keyword:string
}
export class SearchU2UMessageReqDto extends SearchMessageReqDto{
    @IsOptional()
    sender_id:number
    @IsNotEmpty()
    receiver_id:number
}
export class SearchGroupMessageReqDto extends SearchMessageReqDto{
    @IsOptional()
    sender_id:number
    @IsNotEmpty()
    group_id:number
}