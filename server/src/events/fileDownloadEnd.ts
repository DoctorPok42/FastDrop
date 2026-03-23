import { Socket, Server } from 'socket.io';
import state from '../types/state';

const fileDownloadEnd = (io: Server, socket: Socket, data: { fileId: string; userToRespond: string }): void => {
  const { fileId, userToRespond } = data;

  const targetSocket = state.usersSocket.find((s) => s.socketId === userToRespond);
  if (!targetSocket) return;

  targetSocket.socket.emit('fileDownloadEndAlert', {
    fileId,
    sender: socket.id,
  });
};

export default fileDownloadEnd;
