import { Module, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupModule } from '../group/group.module';
import { WebSocketExceptionFilter } from './exception-filter/event-gateway.exception';
import { GroupService } from '../group/services/group.service';
import { AddMember, RemoveMember } from '../group/dtos/req/member.dto';
import { PostModule } from '../post/post.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeStateReqDto } from './dtos/req/state.req.dto';
import { StateRepository } from './repositories/state.repository';
import { StateService } from './services/state.service';
import { State } from './entities/state.entity';
import { StateResDto } from './dtos/res/state.res.dto';

@Module({
    imports:[
        GroupModule, 
        PostModule, 
        AuthModule,
        TypeOrmModule.forFeature([State])
    ],
    providers:[StateService,StateRepository]
})

@WebSocketGateway(82, { transports: ['websocket'] })
@UseFilters(new WebSocketExceptionFilter())
@UsePipes(new ValidationPipe())
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(private readonly groupService:GroupService, private readonly stateService:StateService){}
    afterInit(server: any) {

    }
    handleConnection(socket: Socket) {

    }
    handleDisconnect(client: any) {

    }
    @SubscribeMessage('add-member')
    async addMember(@MessageBody() data: AddMember) {
        const res:boolean = await this.groupService.addMember(data)
        if (!res) throw new WsException('Error')
        const response:WsResponse = {event:'add-member-result',data:true}
        return response
    }
    @SubscribeMessage('remove-member')
    async removeMember(@MessageBody() data: RemoveMember) {
        const res:boolean = await this.groupService.removeMember(data)
        if (!res) throw new WsException('Error')
        const response:WsResponse = {event:'remove-member-result',data:true}
        return response
    }
    @SubscribeMessage('change-state-post')
    async changeStatePost(@MessageBody() data: ChangeStateReqDto) {
        const res:StateResDto = await this.stateService.changeState(data)
        if (!res) throw new WsException('Error')
        const response:WsResponse = {event:'change-state-post',data:res}
        return response
    }
}
