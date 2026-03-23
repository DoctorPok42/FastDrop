import { Socket, Server } from 'socket.io';
import state from '../types/state';
import { sendToRoomMembers } from '../helpersRoom';

const fileChunkEnd = (io: Server, socket: Socket, data: { fileId: string; fileName: string; targetUser: string; username: string }): void => {
  const { fileId, fileName, targetUser, username } = data;

  const targetSocket = state.usersSocket.find((s) => s.socketId === targetUser);
  if (!targetSocket) return;

  targetSocket.socket.emit('fileDownloadEnd', {
    fileId,
    fileName,
    username,
    sender: socket.id,
  });

  sendToRoomMembers(targetUser, (roomId) => {
    socket.to(roomId).emit('fileDownloadEnd', {
      fileId,
      fileName,
      username,
      sender: socket.id,
    });
  });
};

export default fileChunkEnd;
