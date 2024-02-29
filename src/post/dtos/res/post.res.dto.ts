import { Exclude, Expose } from "class-transformer"
import { Profile } from "src/auth/entities/user/profile.entity"
import { FileInfo } from "src/post/entities/post.entity"

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