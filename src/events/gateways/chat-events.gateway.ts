import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../middlewares/ws.middleware';
import { AuthService } from 'src/auth/services/auth.service';
import { CreateMessageReqDto, DeleteMessageReqDto } from 'src/message/dtos/req/userToUserMessage.dto';
import { MessageService } from 'src/message/services/message.service';
import { CreateU2UMessageResDto } from 'src/message/dtos/res/u2u.res.dto';
import { UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketExceptionFilter } from 'src/socket-gateway/exception-filter/event-gateway.exception';
import { SocketTransformPipe } from '../pipes/ws.pipes';
import { LimitGroupMessageReqDto, LimitU2UMessageReqDto } from 'src/message/dtos/req/pagination.dto';
import { MessageEntity } from 'src/message/entities/message.entity';
import { GroupService } from 'src/group/services/group.service';
import { AddMember, OutGroup, RemoveMember } from 'src/group/dtos/req/member.dto';
import { Profile } from 'src/auth/entities/profile.entity';
import { Group } from 'src/group/entities/group.entity';
import { CreateGroupMessageReqDto, DeleteGroupMessageReqDto } from 'src/message/dtos/req/groupMessage.req.dto';
import { GroupMessageResDto } from 'src/message/dtos/res/group.res.dto';
import { ThrottleGuard } from '../guards/throttle.guard';

@WebSocketGateway({ namespace: 'chat' })
@UseFilters(WebSocketExceptionFilter)
@UseGuards(ThrottleGuard)
export class ChatEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private listClients: Map<string, Socket> = new Map() // <socket.id, Socket>
  private listUsers: Map<string, string> = new Map() // <user id, socket.id>
  private listGroups: Map<string, Socket[]> = new Map() // <group.id, Socket[]>    

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly groupService: GroupService
  ) {
    new Promise(() => this.createGroupMap())
  }

  afterInit(client: Socket) {
    try {
      // auth with middleware and set user information
      client.use(SocketAuthMiddleware(this.authService) as any)
    } catch (error) {
      this.handleDisconnect(client)
    }
  }
  handleConnection(client: Socket) {
    this.listClients.set(client.id, client)
    this.listUsers.set(client.data.user.userId, client.id)
    new Promise(() => this.handleUserInGroup(client, true))
  }
  handleDisconnect(client: Socket) {
    this.listUsers.delete(client.data.user.userId)
    this.listClients.delete(client.id)
    new Promise(() => this.handleUserInGroup(client, false))
  }
  // add or remove user in group
  private async handleUserInGroup(client: Socket, add: boolean) {
    const profile: Profile = await this.groupService.getUserWithListGroup(client.data.userId)
    profile.groups.length > 0
      && profile.groups.map((group: Group) => {
        const isMember: boolean = this.listGroups.has(group.id.toString())
        if (isMember) {
          let listClients: Socket[] = this.listGroups.get(group.id.toString())
          // add => push, remove: delete
          add ? listClients.push(client) : listClients = listClients.filter((c) => { return c.data.userId != client.data.userId })
          this.listGroups.set(group.id.toString(), listClients)
        }
      })
  }
  // create group map
  private async createGroupMap() {
    const groups: Group[] = await this.groupService.getAllGroups()
    if (groups.length == 0) return
    groups.map(group => this.listGroups.set(group.id.toString(), []))
  }
  // add new mesage user to user
  @SubscribeMessage('add-u2u-message')
  async addNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) createMessage: CreateMessageReqDto) {
    createMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: CreateU2UMessageResDto = await this.messageService.addNewU2UMessage(createMessage)
    client
      .emit('return-add-u2u-message', data)
    const receiver_client: Socket = this.findOtherUserInConservation(createMessage.receiver)
    if (receiver_client) receiver_client.emit('return-add-u2u-message', data)
  }
  // add new mesage user to user
  @SubscribeMessage('remove-u2u-message')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) deleteMessage: DeleteMessageReqDto) {
    deleteMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: CreateU2UMessageResDto = await this.messageService.deleteU2UMessage(deleteMessage)
    client
      .emit('return-remove-u2u-message', data)
    const receiver_client: Socket = this.findOtherUserInConservation(data.receiver.id)
    if (receiver_client) receiver_client.emit('return-remove-u2u-message', data)
  }
  private findOtherUserInConservation(id: number): Socket {
    if (this.listUsers.has(id.toString())) return this.listClients.get(this.listUsers.get(id.toString()))
    else return null
  }
  // get list message in conservation user to user
  @SubscribeMessage('get-u2u-message')
  async getMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) getMessage: LimitU2UMessageReqDto) {
    getMessage.sender_id = this.listClients.get(client.id).data.user.userId
    const data: MessageEntity[] = await this.messageService.getU2UMessage(getMessage)
    client
      .emit('return-get-u2u-message', data)
  }
  // add member to group
  @SubscribeMessage('add-member')
  async addMember(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: AddMember) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: Profile = await this.groupService.addMember(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.updateSocketGroup(data.groupId, client, true)
    this.emitAllMembers(data.groupId, 'add-member-result', res)
  }
  // remove member
  @SubscribeMessage('remove-member')
  async removeMember(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: RemoveMember) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: Profile = await this.groupService.removeMember(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.emitAllMembers(data.groupId, 'remove-member-result', res)
    this.updateSocketGroup(data.groupId, client, false)
  }
  // add new message in group
  @SubscribeMessage('add-group-message')
  async addNewGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) createMessage: CreateGroupMessageReqDto) {
    createMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: GroupMessageResDto = await this.messageService.addNewGroupMessage(createMessage)
    this.emitAllMembers(createMessage.group_id, 'return-add-group-message', data)
  }
  @SubscribeMessage('remove-group-message')
  async removeGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) deleteMessage: DeleteGroupMessageReqDto) {
    deleteMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: GroupMessageResDto = await this.messageService.deleteGroupMessage(deleteMessage)
    this.emitAllMembers(deleteMessage.group_id, 'return-remove-group-message', data)
  }
  @SubscribeMessage('out-group-message')
  async outGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) outGroup: OutGroup) {
    outGroup.memberId = this.listClients.get(client.id).data.user.userId
    const data: Profile = await this.groupService.outGroup(outGroup)
    this.updateSocketGroup(outGroup.groupId, client, false)
    this.emitAllMembers(outGroup.groupId, 'out-group-message', data)
  }
  // get list message in conservation user to user
  @SubscribeMessage('get-group-message')
  async getGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) getMessage: LimitGroupMessageReqDto) {
    getMessage.sender_id = this.listClients.get(client.id).data.user.userId
    const data: MessageEntity[] = await this.messageService.getGroupMessage(getMessage)
    client
      .emit('return-get-group-message', data)
  }
  private emitAllMembers(groupId: number, event: string, data: any) {
    if (this.listGroups.has(groupId.toString())) {
      this.listGroups.get(groupId.toString()).map((user: Socket) => {
        user.emit(event, data)
      })
    }
  }
  private updateSocketGroup(group_id: number, client: Socket, add: boolean) {
    if (this.listGroups.has(group_id.toString())) {
      let listClients: Socket[] = this.listGroups.get(group_id.toString())
      add ? listClients.push(client) : listClients = listClients.filter((c) => { return c.data.userId != client.data.userId })
      this.listGroups.set(group_id.toString(), listClients)
    }
  }
}
