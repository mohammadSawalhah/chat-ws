import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
  event: string;
  clientId: string;
  message?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: Socket[] = [];

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    this.clients.push(client);
    this.server.emit('newClient', {
      event: 'newClient',
      clientId: client.id,
    } as ChatMessage);
    console.log('client connected');
  }

  handleDisconnect(client: Socket): void {
    this.clients = this.clients.filter((c) => c !== client);
    this.server.emit(
      'disconnted',
      `Client Disconnected [${client.id.slice(0, 5)}]`,
    );
    console.log('client disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, data: string) {
    this.server.emit('message', {
      event: 'message',
      clientId: client.id,
      message: data,
    } as ChatMessage);
  }
}
