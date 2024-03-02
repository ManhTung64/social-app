import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repository.common";
import { State } from "../entities/state.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class StateRepository extends BaseRepository<State>{
    constructor(@InjectRepository(State) private stateRepository: Repository<State>) {
        super(stateRepository)
    }
    public async saveData(state: State): Promise<State> {
        return await this.stateRepository.save(state)
    }
    public async findById(id: number, isUserId: boolean, isPostId: boolean): Promise<State[]> {
        if (isUserId) return await this.stateRepository.find(
            {
                where: {
                    user: { id: id }
                }
            })
        else if (isPostId) return await this.stateRepository.find(
            {
                where: {
                    post: { id: id }
                }
            })
        else return await this.stateRepository.find({ where: { id: id } })
    }
    public async findOneById(id: number): Promise<State> {
        return await this.stateRepository.findOne(
            {
                where: {
                    id: id
                }
            })
    }
    public async findOneByUserAndPost(userId: number, postId: number):Promise<State> {
        return await this.stateRepository.findOne(
            {
                where:
                {
                    user: { id: userId },
                    post: { id: postId }
                }
            })
    }
}