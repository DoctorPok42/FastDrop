import { Socket, Server } from 'socket.io';
import state from '../types/state';

const fileUpload = (io: Server, socket: Socket, file: Buffer, fileName: string, targetUserId: string, username: string): void => {
  const targetUser = state.usersSocket.find((socket) => socket.socketId === targetUserId);

  if (targetUser) {
    targetUser.socket.emit('fileDownload', file, fileName, username);
  }
};

export default fileUpload;
