import { IsNotEmpty, IsOptional } from "class-validator"

export class AddMember{
    @IsNotEmpty()
    memberId:number
    @IsNotEmpty()
    groupId:number
}
export class RemoveMember extends AddMember{

}