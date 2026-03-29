import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.data.userId = userId;
      // Join all user's rooms on connect
      const rooms = await this.chatService.getUserRoomIds(userId);
      rooms.forEach((roomId) => client.join(roomId));
    }
  }

  handleDisconnect(_client: Socket) {
    // Cleanup handled by socket.io
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; content: string; type?: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) return;

    const message = await this.chatService.createMessage(
      data.roomId,
      userId,
      data.content,
      data.type || 'TEXT',
    );

    this.server.to(data.roomId).emit('message_received', message);
    return message;
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) return;
    client
      .to(data.roomId)
      .emit('user_typing', { userId, roomId: data.roomId });
  }

  @SubscribeMessage('read_receipt')
  async handleReadReceipt(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId) return;
    await this.chatService.markAsRead(data.roomId, userId);
    client
      .to(data.roomId)
      .emit('messages_read', { userId, roomId: data.roomId });
  }
}
