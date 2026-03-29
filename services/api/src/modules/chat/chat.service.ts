import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get all room IDs a user belongs to (for WebSocket join on connect) */
  async getUserRoomIds(userId: string): Promise<string[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      select: { roomId: true },
      take: 100,
    });
    return participants.map((p) => p.roomId);
  }

  /** List rooms for a user with last message and unread count */
  async getRooms(userId: string) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            participants: {
              select: { userId: true },
            },
            messages: {
              where: { isDeleted: false },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                senderId: true,
                type: true,
                content: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { room: { updatedAt: 'desc' } },
      take: 50,
    });

    const rooms = await Promise.all(
      participants.map(async (p) => {
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            roomId: p.roomId,
            isDeleted: false,
            createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
            senderId: { not: userId },
          },
        });

        return {
          id: p.room.id,
          type: p.room.type,
          name: p.room.name,
          participants: p.room.participants.map((pt) => pt.userId),
          lastMessage: p.room.messages[0] ?? null,
          unreadCount,
          updatedAt: p.room.updatedAt,
        };
      }),
    );

    return rooms;
  }

  /** Create a new chat room and add participants */
  async createRoom(
    userId: string,
    type: string,
    participantIds: string[],
    name?: string,
  ) {
    // Ensure creator is included in participant list
    const allParticipantIds = Array.from(
      new Set([userId, ...participantIds]),
    );

    const room = await this.prisma.chatRoom.create({
      data: {
        type,
        name,
        participants: {
          create: allParticipantIds.map((uid) => ({ userId: uid })),
        },
      },
      include: {
        participants: {
          select: { userId: true, joinedAt: true },
        },
      },
    });

    return room;
  }

  /** Get paginated messages for a room (verifies user membership) */
  async getMessages(roomId: string, userId: string, page: number = 1) {
    // Verify user is a participant
    await this.verifyParticipant(roomId, userId);

    const take = 50;
    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { roomId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
        select: {
          id: true,
          roomId: true,
          senderId: true,
          type: true,
          content: true,
          createdAt: true,
        },
      }),
      this.prisma.chatMessage.count({
        where: { roomId, isDeleted: false },
      }),
    ]);

    return { data: messages, total, page, limit: take };
  }

  /** Create a new message in a room */
  async createMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: string = 'TEXT',
  ) {
    // Verify sender is a participant
    await this.verifyParticipant(roomId, senderId);

    const message = await this.prisma.chatMessage.create({
      data: { roomId, senderId, content, type },
      select: {
        id: true,
        roomId: true,
        senderId: true,
        type: true,
        content: true,
        createdAt: true,
      },
    });

    // Touch the room updatedAt so it sorts to top
    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /** Mark all messages in a room as read for a user */
  async markAsRead(roomId: string, userId: string) {
    await this.prisma.chatParticipant.update({
      where: { roomId_userId: { roomId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  /** Soft delete a message (only sender can delete) */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });
  }

  /** Verify a user is a participant of a room, throw if not */
  private async verifyParticipant(
    roomId: string,
    userId: string,
  ): Promise<void> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant of this chat room',
      );
    }
  }
}
