import { Socket, Server } from 'socket.io';
import state from '../types/state';

const fileUploadLarge = (io: Server, socket: Socket, file: Buffer, fileName: string, targetUserId: string, username: string, filePosition: number, fileLength: number): void => {
  state.filesStorage.push({
    file: file,
    fileName: fileName,
    targetUserId: targetUserId,
    username: username,
    checked: true,
  });

  if (filePosition + 1 == fileLength) {
    console.log(
      'fileUploadLargeEnd',
      state.filesStorage.map((file) => file.fileName)
    );
    const targetUser = state.usersSocket.find((socket) => socket.socketId === targetUserId);

    if (targetUser) {
      const files = state.filesStorage.filter(
        (file) => file.targetUserId === targetUserId && file.username === username
      );
      state.filesStorage = state.filesStorage.filter(
        (file) => file.targetUserId !== targetUserId
      );
      targetUser.socket.emit('fileDownloadLarge', files, username);
    }
  }
};

export default fileUploadLarge;
