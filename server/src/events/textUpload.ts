import { Socket, Server } from 'socket.io';
import state from '../types/state';
import { sendToRoomMembers } from '../helpersRoom';

const textUpload = (io: Server, socket: Socket, text: string, targetUserId: string, username: string): void => {
  const targetUser = state.usersSocket.find((socket) => socket.socketId === targetUserId);

  if (targetUser) {
    targetUser.socket.emit('textDownload', text, username);
  }

  sendToRoomMembers(targetUserId, (roomId) => {
    socket.to(roomId).emit('textDownload', text, username);
  });
};

export default textUpload;
