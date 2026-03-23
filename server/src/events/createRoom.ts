import { Socket, Server } from 'socket.io';
import { User } from '../types/types';
import state from '../types/state';

const createRoom = (io: Server, socket: Socket, data: { users: User[] }): void => {
  const { users } = data;
  const roomId = `room-${Math.floor(Math.random() * 100000)}`;
  socket.join(roomId);

  state.rooms.set(roomId, users);

  users.forEach((user) => {
    const targetSocket = state.usersSocket.find((s) => s.socketId === user.socketId);
    if (targetSocket) {
      state.rooms.set(roomId, users);
      targetSocket.socket.join(roomId);
      targetSocket.socket.emit('roomCreated', roomId);
    }
  });
};

export default createRoom;
