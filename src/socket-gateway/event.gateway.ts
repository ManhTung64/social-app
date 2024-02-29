import { Module, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupModule } from '../group/group.module';
import { WebSocketExceptionFilter } from './exception-filter/event-gateway.exception';
import { GroupService } from '../group/services/group.service';
import { AddMember, RemoveMember } from '../group/dtos/req/member.dto';

@Module({
    imports:[GroupModule]
})

@WebSocketGateway(81, { transports: ['websocket'] })
@UseFilters(new WebSocketExceptionFilter())
@UsePipes(new ValidationPipe())
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    constructor(private readonly groupService:GroupService){}
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
}
