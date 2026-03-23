import { Socket, Server } from 'socket.io';
import state from '../types/state';

interface TransferResponseData {
  transferId: string;
  accepted: boolean;
  senderSocketId: string;
}

const transferResponse = (io: Server, socket: Socket, data: TransferResponseData): void => {
  const { transferId, accepted, senderSocketId } = data;
  const userName = state.users.find((u) => u.socketId === socket.id)?.name || 'Unknown';

  const senderSocket = state.usersSocket.find((s) => s.socketId === senderSocketId);

  if (senderSocket) {
    senderSocket.socket.emit('receiveTransferResponse', {
      transferId,
      accepted,
      userSocketId: socket.id,
      userName,
    });
  }
};

export default transferResponse;
