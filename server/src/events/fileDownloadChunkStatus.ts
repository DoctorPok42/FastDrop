import { Socket, Server } from 'socket.io';
import state from '../types/state';

const fileDownloadChunkStatus = (io: Server, socket: Socket, data: { currentChunk: number; totalChunks: number; userToRespond: string }): void => {
  const { currentChunk, totalChunks, userToRespond } = data;

  const targetSocket = state.usersSocket.find((s) => s.socketId === userToRespond);
  if (!targetSocket) return;

  const senderUser = state.users.find((u) => u.socketId === socket.id);

  targetSocket.socket.emit('fileDownloadChunkStatusAlert', {
    currentChunk,
    totalChunks,
    senderUsername: senderUser?.name,
  });
};

export default fileDownloadChunkStatus;
