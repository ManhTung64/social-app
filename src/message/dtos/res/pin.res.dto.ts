import { Exclude, Expose } from "class-transformer";
import { CreateU2UMessageResDto } from "./u2u.res.dto";
import { GroupMessageResDto } from "./group.res.dto";

@Exclude()
export class PinU2UMessageResDto extends CreateU2UMessageResDto{
    @Expose()
    pin_id:number
}
@Exclude()
export class PinGroupMessageResDto extends GroupMessageResDto{
    @Expose()
    pin_id:number
}