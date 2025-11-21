import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('suscribirse-a-transaccion')
  handleSubscription(
    @MessageBody() data: { transaccionId: String },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`transaccion_${data.transaccionId}`);
    return {
      ok: true,
      message: `Suscrito a transaccion_${data.transaccionId}`,
    };
  }

  notificarPagoCompletado(transaccionId: String, payload: any) {
    this.server.to(`transaccion_${transaccionId}`).emit(
      'pago-completado',
      payload,
    );
  }
}