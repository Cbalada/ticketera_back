import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('event.subscribe')
  subscribeToEvent(@ConnectedSocket() client: Socket, @MessageBody('eventId') eventId: number) {
    void client.join(`event:${eventId}`);
    return { event: `event:${eventId}` };
  }
}
