import { Exclude, Expose } from "class-transformer"
import { Profile } from "src/auth/entities/profile.entity"

@Exclude()
export class GroupResDto {
    @Expose()
    id: number
    @Expose()
    name: string
    @Expose()
    creator: Profile
    @Expose()
    members:Profile[]
}