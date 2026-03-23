import { User, UserSocket, FileData } from './types';

interface AppState {
  users: User[];
  usersSocket: UserSocket[];
  filesStorage: FileData[];
  fileChunks: Map<string, Buffer[]>;
  rooms: Map<string, User[]>;
}

export const state: AppState = {
  users: [],
  usersSocket: [],
  filesStorage: [],
  fileChunks: new Map(),
  rooms: new Map(),
};

export default state;
