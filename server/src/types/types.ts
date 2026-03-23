import { Socket } from 'socket.io';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface User {
  name: string;
  socketId: string;
  privacyLevel: string;
  location: Location | null;
}

export interface UserSocket {
  socket: Socket;
  socketId: string;
}

export interface FileData {
  file: Buffer;
  fileName: string;
  targetUserId: string;
  username: string;
  checked: boolean;
}

export interface FileChunkData {
  fileId: string;
  chunk: Buffer;
  fileName: string;
  targetUser: string;
  username: string;
  currentChunk: number;
  totalChunks: number;
}

export interface Room {
  users: User[];
}
