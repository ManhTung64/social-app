import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../middlewares/ws.middleware';
import { AuthService } from 'src/auth/services/auth.service';

@WebSocketGateway({ namespace: 'state-events' })

export class StateEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly authService:AuthService){}
  @WebSocketServer() server: Server;
  private listClients: Map<string, Socket> = new Map() // <socket.id, Socket>
  // private listGroups: Map<string, Socket[]> = new Map() // <group.id, Socket[]>     

  afterInit(client: Socket){
    try{
      // auth with middleware and set user information
      client.use(SocketAuthMiddleware(this.authService) as any)
    }catch(error){
      this.handleDisconnect(client)
    }
  }
  handleConnection(client: Socket) {
    console.log('Connected ' + client.id)
    this.listClients.set(client.id, client)
    console.log(client.data.user)
  }
  handleDisconnect(client: Socket) {
    console.log('Disconnected ' + client.id)
    this.listClients.delete(client.id)
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any) {
    
  }
  // create message : return 
  // send new: emit receiver, sender
  // 
}
