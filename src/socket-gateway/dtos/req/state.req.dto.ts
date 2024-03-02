import { IsEnum, IsNotEmpty, IsOptional } from "class-validator"
import { StateType } from "../../../socket-gateway/entities/state.entity"

export class ChangeStateReqDto{
    @IsOptional()
    userId:number
    
    @IsNotEmpty()
    postId:number

    @IsEnum(StateType, {message:'state is invalid'})
    state:StateType
}