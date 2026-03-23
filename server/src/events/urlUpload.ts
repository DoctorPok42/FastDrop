import { Socket, Server } from 'socket.io';
import state from '../types/state';
import { sendToRoomMembers } from '../helpersRoom';

const urlUpload = (io: Server, socket: Socket, url: string, targetUserId: string, username: string): void => {
  console.log('urlUpload', url, targetUserId);
  const targetUser = state.usersSocket.find((socket) => socket.socketId === targetUserId);

  if (targetUser) {
    targetUser.socket.emit('urlDownload', url, username);
  }

  sendToRoomMembers(targetUserId, (roomId) => {
    socket.to(roomId).emit('urlDownload', url, username);
  });
};

export default urlUpload;
