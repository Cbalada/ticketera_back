import { Server, Socket } from 'socket.io';
export declare class RealtimeGateway {
    server: Server;
    subscribeToEvent(client: Socket, eventId: number): {
        event: string;
    };
}
