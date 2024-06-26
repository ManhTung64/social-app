import { IsNotEmpty, IsOptional } from "class-validator"

export class AddMember{
    @IsNotEmpty()
    memberId:number
    @IsNotEmpty()
    groupId:number
    @IsOptional()
    creator:number
}
export class RemoveMember extends AddMember{

}
export class OutGroup{
    @IsOptional()
    memberId:number
    @IsNotEmpty()
    groupId:number
}