import { Exclude, Expose } from "class-transformer"
import { Profile } from "../../../auth/entities/profile.entity"
import { FileInfo } from "../../../post/entities/post.entity"

@Expose()
export class PostResDto{

    id: number

    title:string

    content:string
    
    hashtag:string
    
    files:FileInfo[]
    
    updateAt:Date
    
    user: Profile;
    
    comments:Comment[]
}