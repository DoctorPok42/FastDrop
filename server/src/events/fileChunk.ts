import { Socket, Server } from 'socket.io';
import { FileChunkData } from '../types/types';
import state from '../types/state';
import { sendToRoomMembers } from '../helpersRoom';

const fileChunk = (io: Server, socket: Socket, data: FileChunkData): void => {
  const {
    fileId,
    chunk,
    fileName,
    targetUser,
    username,
    currentChunk,
    totalChunks,
  } = data;

  if (!state.fileChunks.has(fileId)) {
    state.fileChunks.set(fileId, []);
  }

  state.fileChunks.get(fileId)!.push(Buffer.from(chunk));

  const targetSocket = state.usersSocket.find((s) => s.socketId === targetUser);
  if (!targetSocket) return;

  targetSocket.socket.emit('fileDownloadChunk', {
    fileId,
    chunk,
    fileName,
    username,
    currentChunk,
    totalChunks,
    sender: socket.id,
  });

  sendToRoomMembers(targetUser, (roomId) => {
    socket.to(roomId).emit('fileDownloadChunk', {
      fileId,
      chunk,
      fileName,
      username,
      currentChunk,
      totalChunks,
      sender: socket.id,
    });
  });
};

export default fileChunk;
