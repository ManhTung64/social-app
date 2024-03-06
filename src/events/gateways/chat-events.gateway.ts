import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../middlewares/ws.middleware';
import { AuthService } from 'src/auth/services/auth.service';
import { CreateMessageReqDto } from 'src/message/dtos/userToUserMessage.dto';
import { MessageService } from 'src/message/services/message.service';
import { CreateU2UMessageResDto } from 'src/message/dtos/res/u2u.res.dto';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketExceptionFilter } from 'src/socket-gateway/exception-filter/event-gateway.exception';
import { SocketTransformPipe } from '../pipes/ws.pipes';

@WebSocketGateway({ namespace: 'chat' })
@UseFilters(WebSocketExceptionFilter)
export class ChatEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private listClients: Map<string, Socket> = new Map() // <socket.id, Socket>
  private listUsers: Map<string, string> = new Map() // <user id, socket.id>
  // private listGroups: Map<string, Socket[]> = new Map() // <group.id, Socket[]>    

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService
  ) { }

  afterInit(client: Socket) {
    try {
      // auth with middleware and set user information
      client.use(SocketAuthMiddleware(this.authService) as any)
    } catch (error) {
      this.handleDisconnect(client)
    }
  }
  handleConnection(client: Socket) {
    console.log('Connected ' + client.id)

    this.listClients.set(client.id, client)
    this.listUsers  .set(client.data.user.accountId, client.id)
  }
  handleDisconnect(client: Socket) {
    console.log('Disconnected ' + client.id)

    this.listUsers  .delete(client.data.user.accountId)
    this.listClients.delete(client.id)
  }

  @SubscribeMessage('add-u2u-message')
  // @UsePipes(SocketTransformPipe)
  async addNewMessage(client: Socket, @MessageBody(SocketTransformPipe) createMessage: CreateMessageReqDto) {
    const data: CreateU2UMessageResDto = await this.messageService.addNewU2UMessage(createMessage)
    client
      .emit('return-add-u2u-message', data)

    this.findOtherUserInConservation(createMessage.receiver)
      .emit('return-add-u2u-message', data)
  }
  private findOtherUserInConservation(id: number): Socket {
    if (this.listUsers.has(id.toString())) return this.listClients.get(this.listUsers.get(id.toString()))
    else return null
  }
}
