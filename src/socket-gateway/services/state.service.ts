import { UserRepository } from "../../auth/repositories/user.repository";
import { StateRepository } from "../repositories/state.repository";
import { PostRepository } from "../../post/repositories/post.repository";
import { Profile } from "../../auth/entities/profile.entity";
import { PostContent } from "../../post/entities/post.entity";
import { ChangeStateReqDto } from "../dtos/req/state.req.dto";
import { State, StateType } from "../entities/state.entity";
import { WsException } from "@nestjs/websockets";
import { StateChangeRes, StateResDto } from "../dtos/res/state.res.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StateService {
    constructor(private readonly stateRepository: StateRepository,
        private readonly userRepository: UserRepository,
        private readonly postRepository: PostRepository
    ) { }
    private async checkExAndReturnUserAndPost(userId: number, postId: number): Promise<[Profile, PostContent] | null> {
        const [user, post] = await Promise.all([
            this.userRepository.findOneById(userId),
            this.postRepository.findOneById(postId)
        ])
        if (!user || !post) return null
        return [user.profile, post]
    }
    public async changeState(state: ChangeStateReqDto): Promise<StateResDto> {
        const [userAndPost, isExState] = await Promise.all([
            this.checkExAndReturnUserAndPost(state.userId, state.postId),
            this.stateRepository.findOneByUserAndPost(state.userId, state.postId)
        ])
        if (!userAndPost) throw new WsException('Information is invalid')
        let result: StateResDto
        switch (state.state) {
            //like
            case StateType.like:
                // unlike
                if (isExState && isExState.type == StateType.like)
                    result = { state: await this.delete(isExState), type: StateChangeRes.delete }
                // disliked 
                else if (isExState && isExState.type == StateType.dislike)
                    result = {
                        state: await this.stateRepository.saveData({ ...isExState, type: state.state }),
                        type: StateChangeRes.change
                    }
                // not state
                else if (!isExState)
                    result = {
                        state: await this.addNew(state, userAndPost[0], userAndPost[1]),
                        type: StateChangeRes.add
                    }
                // err
                else throw new WsException('Error')
            case StateType.dislike:
                // undislike
                if (isExState && isExState.type == StateType.dislike)
                    result = { state: await this.delete(isExState), type: StateChangeRes.delete }
                // liked 
                else if (isExState && isExState.type == StateType.like)
                    result = {
                        state: await this.stateRepository.saveData({ ...isExState, type: state.state }),
                        type: StateChangeRes.change
                    }
                // not state
                else if (!isExState)
                    result = {
                        state: await this.addNew(state, userAndPost[0], userAndPost[1]),
                        type: StateChangeRes.add
                    }
                // err
                else throw new WsException('Error')
        }
        return result
    }
    private async addNew(state: ChangeStateReqDto, user: Profile, post: PostContent): Promise<State> {
        let newState: State = { user, post, type: state.state }
        newState = await this.stateRepository.saveData(newState)
        if (!newState) throw new WsException('Add failed')
        else return newState
    }
    private async delete(state: State): Promise<State> {
        const deleteState: State = await this.stateRepository.delete(state.id)
        if (!deleteState) throw new WsException('Error')
        else return deleteState
    }
}