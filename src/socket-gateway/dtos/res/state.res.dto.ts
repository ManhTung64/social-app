import { Exclude, Expose } from "class-transformer"
import { State, StateType } from "../../../socket-gateway/entities/state.entity"
@Expose()
export class StateResDto{
    state:State
    type:StateChangeRes
}
export enum StateChangeRes{
    change = 'change',
    delete = 'delete',
    add    = 'add'
}