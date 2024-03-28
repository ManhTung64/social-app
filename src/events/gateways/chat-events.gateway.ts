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
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { PinGroupConservationReqDto, PinGroupMessageReqDto, PinU2UConservationReqDto, PinU2UMessageReqDto, UnPinGroupMessageReqDto, UnPinU2UMessageReqDto } from 'src/message/dtos/req/pin.req.dto';
import { PinMessageService } from 'src/message/services/pin.service';
import { PinGroupMessageResDto, PinU2UMessageResDto } from 'src/message/dtos/res/pin.res.dto';
import { PinMessageEntity } from 'src/message/entities/pin.entity';
import { SearchGroupMessageReqDto, SearchU2UMessageReqDto } from 'src/message/dtos/req/search.req.dto';
import { ChangeCreatorDto, ChangeNameReqDto, DeleteGroupReqDto } from 'src/group/dtos/req/group.dto';
import { GroupResDto } from 'src/group/dtos/res/group.res.dto';
import { WebSocketExceptionFilter } from '../exception-filter/event-gateway.exception';
import { U2UQueueMessageInterceptor } from '../interceptors/u2uQueueMessage.interceptor';
import { plainToClass } from 'class-transformer';
import { SocketDto } from '../dtos/res/socketResDto';
import { GroupQueueMessageInterceptor } from '../interceptors/groupQueueMessage.interceptor';

@WebSocketGateway({ namespace: 'chat' })
@UseFilters(WebSocketExceptionFilter)
@UseGuards(ThrottleGuard)
export class ChatEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private listClients: Map<string, Socket> // <socket.id, Socket>
  private listUsers: Map<string, string> // <user id, socket.id>
  private listGroups: Map<string, Socket[]> // <group.id, Socket[]>    
  public SERVER_ID: number = 1

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly groupService: GroupService,
    private readonly pinService: PinMessageService,
  ) {
    this.listClients = new Map()
    this.listUsers = new Map()
    this.listGroups = new Map()
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
  // add new mesage user to user
  @SubscribeMessage('add-u2u-message')
  @UseInterceptors(U2UQueueMessageInterceptor)
  async addNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) createMessage: CreateMessageReqDto) {
    createMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: CreateU2UMessageResDto = await this.messageService.addNewU2UMessage(createMessage)
    const receiver_client: Socket = this.findOtherUserInConservation(createMessage.receiver)
    if (receiver_client) receiver_client.emit('return-add-u2u-message', data)
    return plainToClass(SocketDto, { data, event: 'return-add-u2u-message', server_id: this.SERVER_ID })
  }
  // remove mesage user to user
  @SubscribeMessage('remove-u2u-message')
  @UseInterceptors(U2UQueueMessageInterceptor)
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) deleteMessage: DeleteMessageReqDto) {
    deleteMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: CreateU2UMessageResDto = await this.messageService.deleteU2UMessage(deleteMessage)
    const receiver_client: Socket = this.findOtherUserInConservation(data.receiver.id)
    if (receiver_client) receiver_client.emit('return-remove-u2u-message', data)
    return plainToClass(SocketDto, { data, event: 'return-remove-u2u-message', server_id: this.SERVER_ID })
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
  // search u2u message
  @SubscribeMessage('search-u2u-message')
  async searchU2UMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) searchDto: SearchU2UMessageReqDto) {
    searchDto.sender_id = this.listClients.get(client.id).data.user.userId
    const data: MessageEntity[] = await this.messageService.searchU2UByKeyword(searchDto)
    client
      .emit('return-search-u2u-message', data)
  }
  // pin message in u2u conservation
  @SubscribeMessage('pin-u2u-message')
  @UseInterceptors(U2UQueueMessageInterceptor)
  async pinU2UMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) pinMessage: PinU2UMessageReqDto) {
    pinMessage.sender_id = this.listClients.get(client.id).data.user.userId
    const data: PinU2UMessageResDto = await this.pinService.pinU2UMessage(pinMessage)
    const receiver_client: Socket = this.findOtherUserInConservation(data.receiver.id)
    if (receiver_client) receiver_client.emit('return-pin-u2u-message', data)
    return plainToClass(SocketDto, { data, event: 'return-pin-u2u-message', server_id: this.SERVER_ID })
  }
  // unpin message in u2u conservation
  @SubscribeMessage('unpin-u2u-message')
  @UseInterceptors(U2UQueueMessageInterceptor)
  async unPinU2UMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) unpinMessage: UnPinU2UMessageReqDto) {
    unpinMessage.sender_id = this.listClients.get(client.id).data.user.userId
    const data: PinU2UMessageResDto = await this.pinService.unPinU2UMessage(unpinMessage)
    const receiver_client: Socket = this.findOtherUserInConservation(data.receiver.id)
    if (receiver_client) receiver_client.emit('return-unpin-u2u-message', data)
    return plainToClass(SocketDto, { data, event: 'return-unpin-u2u-message', server_id: this.SERVER_ID })
  }
  // get list pin message of u2u conservation
  @SubscribeMessage('get-pin-u2u-messages')
  async getPinU2UMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) conservation: PinU2UConservationReqDto) {
    conservation.sender_id = this.listClients.get(client.id).data.user.userId
    const data: PinMessageEntity[] = await this.pinService.getAllPinMessageOfU2Uconservation(conservation)
    client
      .emit('return-get-pin-u2u-messages', data)
  }
  // add member to group
  @SubscribeMessage('add-member')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async addMember(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: AddMember) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: Profile = await this.groupService.addMember(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.updateSocketGroup(data.groupId, client, true)
    this.emitAllMembers(data.groupId, 'add-member-result', res)
    return plainToClass(SocketDto, { data, event: 'add-member-result', server_id: this.SERVER_ID })
  }
  // remove member
  @SubscribeMessage('remove-member')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async removeMember(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: RemoveMember) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: Profile = await this.groupService.removeMember(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.emitAllMembers(data.groupId, 'remove-member-result', res)
    this.updateSocketGroup(data.groupId, client, false)
    return plainToClass(SocketDto, { data, event: 'remove-member-result', server_id: this.SERVER_ID })
  }
  // change group name
  @SubscribeMessage('change-group-name')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async changeGroupname(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: ChangeNameReqDto) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: GroupResDto = await this.groupService.changeGroupName(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.emitAllMembers(data.group_id, 'return-change-group-name', res)
    return plainToClass(SocketDto, { data, event: 'return-change-group-name', server_id: this.SERVER_ID })
  }
  // change creator of group
  @SubscribeMessage('change-creator')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async changeCreator(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: ChangeCreatorDto) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: GroupResDto = await this.groupService.changeCreator(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.emitAllMembers(data.group_id, 'return-change-creator', res)
    return plainToClass(SocketDto, { data, event: 'return-change-creator', server_id: this.SERVER_ID })
  }
  // delete group with creator
  @SubscribeMessage('delete-group')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async deleteGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) data: DeleteGroupReqDto) {
    data.creator = this.listClients.get(client.id).data.user.userId
    const res: GroupResDto = await this.groupService.deleteGroup(data)
    if (!res) throw new WebSocketExceptionFilter()
    this.emitAllMembers(data.group_id, 'return-change-creator', res)
    // remove clients
    this.listGroups.delete(data.group_id.toString())
    return plainToClass(SocketDto, { data, event: 'return-change-creator', server_id: this.SERVER_ID })
  }
  // add new message in group
  @SubscribeMessage('add-group-message')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async addNewGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) createMessage: CreateGroupMessageReqDto) {
    createMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: GroupMessageResDto = await this.messageService.addNewGroupMessage(createMessage)
    this.emitAllMembers(createMessage.group_id, 'return-add-group-message', data)
    return plainToClass(SocketDto, { data, event: 'return-add-group-message', server_id: this.SERVER_ID })
  }
  // remove message in group
  @SubscribeMessage('remove-group-message')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async removeGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) deleteMessage: DeleteGroupMessageReqDto) {
    deleteMessage.sender = this.listClients.get(client.id).data.user.userId
    const data: GroupMessageResDto = await this.messageService.deleteGroupMessage(deleteMessage)
    this.emitAllMembers(deleteMessage.group_id, 'return-remove-group-message', data)
    return plainToClass(SocketDto, { data, event: 'return-remove-group-message', server_id: this.SERVER_ID })
  }
  // member out group
  @SubscribeMessage('out-group')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async outGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) outGroup: OutGroup) {
    outGroup.memberId = this.listClients.get(client.id).data.user.userId
    const data: Profile = await this.groupService.outGroup(outGroup)
    client.emit('out-group-message', data)
    this.updateSocketGroup(outGroup.groupId, client, false)
    this.emitAllMembers(outGroup.groupId, 'out-group-message', data)
    return plainToClass(SocketDto, { data, event: 'out-group-message', server_id: this.SERVER_ID })
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
  // search group message
  @SubscribeMessage('search-group-message')
  async searchGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) searchDto: SearchGroupMessageReqDto) {
    searchDto.sender_id = this.listClients.get(client.id).data.user.userId
    const data: MessageEntity[] = await this.messageService.searchGroupByKeyword(searchDto)
    client
      .emit('return-search-group-message', data)
  }
  // pin message in u2u conservation
  @SubscribeMessage('pin-group-message')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async pinGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) pinMessage: PinGroupMessageReqDto) {
    pinMessage.creator = this.listClients.get(client.id).data.user.userId
    const data: PinGroupMessageResDto = await this.pinService.pinGroupMessage(pinMessage)
    this.emitAllMembers(data.group.id, 'return-pin-group-message', data)
    return plainToClass(SocketDto, { data, event: 'return-pin-group-message', server_id: this.SERVER_ID })
  }
  // unpin message in u2u conservation
  @SubscribeMessage('unpin-group-message')
  @UseInterceptors(GroupQueueMessageInterceptor)
  async unPinGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) unpinMessage: UnPinGroupMessageReqDto) {
    unpinMessage.creator_id = this.listClients.get(client.id).data.user.userId
    const data: PinGroupMessageResDto = await this.pinService.unPinGroupMessage(unpinMessage)
    this.emitAllMembers(data.group.id, 'return-unpin-group-message', data)
    return plainToClass(SocketDto, { data, event: 'return-unpin-group-message', server_id: this.SERVER_ID })
  }
  // get list pin message of u2u conservation
  @SubscribeMessage('get-pin-group-messages')
  async getPinGroupMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody(SocketTransformPipe) conservation: PinGroupConservationReqDto) {
    conservation.user_id = this.listClients.get(client.id).data.user.userId
    const data: PinMessageEntity[] = await this.pinService.getAllPinMessageOfGroupconservation(conservation)
    client
      .emit('return-get-pin-u2u-messages', data)
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
          if (add) listClients.push(client) && client.join(group.id.toString())
          else {
            listClients = listClients.filter((c) => { return c.data.userId != client.data.userId })
            client.leave(group.id.toString())
          }
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
  // find receiver in u2u convervation
  private findOtherUserInConservation(id: number): Socket {
    if (this.listUsers.has(id.toString())) return this.listClients.get(this.listUsers.get(id.toString()))
    else return null
  }
  // emit all member in group
  public emitU2U(receiver_id: number, event: string, data: any) {
    const receiver: Socket = this.findOtherUserInConservation(receiver_id)
    if (receiver) receiver.emit(event, data)
  }
  // emit all member in group
  public emitAllMembers(groupId: number, event: string, data: any) {
    if (this.listGroups.has(groupId.toString())) this.server.to(groupId.toString()).emit(event,data)
    else throw new WsException('Connected error')
  }
  // update (remove or add) member in group
  private updateSocketGroup(group_id: number, client: Socket, add: boolean) {
    if (this.listGroups.has(group_id.toString())) {
      let listClients: Socket[] = this.listGroups.get(group_id.toString())
      add ? listClients.push(client) : listClients = listClients.filter((c) => { return c.data.userId != client.data.userId })
      this.listGroups.set(group_id.toString(), listClients)
    }
  }
}
