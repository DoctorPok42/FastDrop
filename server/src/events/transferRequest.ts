import { Socket, Server } from 'socket.io';
import state from '../types/state';

interface TransferRequestData {
  transferId: string;
  senderName: string;
  targetUserIds: string[];
  transferType: 'file' | 'text' | 'url';
  fileNames?: string[];
}

const transferRequest = (io: Server, socket: Socket, data: TransferRequestData): void => {
  const { transferId, senderName, targetUserIds, transferType, fileNames } = data;

  targetUserIds.forEach((targetUserId) => {
    const targetSocket = state.usersSocket.find((s) => s.socketId === targetUserId);

    if (targetSocket) {
      targetSocket.socket.emit('receiveTransferRequest', {
        transferId,
        senderName,
        senderSocketId: socket.id,
        transferType,
        fileNames: fileNames || [],
      });
    }
  });
};

export default transferRequest;
