import { Exclude, Expose } from "class-transformer"
import { Profile } from "src/auth/entities/user/profile.entity"
import { PostContent } from "src/post/entities/post.entity"
@Exclude()
export class CommentResDto{
    @Expose()
    id:number
    @Expose()
    content:string
    @Expose()
    updateAt:Date
    @Expose()
    userId:number
    @Expose()
    postId:number
    user:Profile
    post:PostContent
}