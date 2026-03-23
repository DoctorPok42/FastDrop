import { Socket, Server } from 'socket.io';
import state from '../types/state';

const disconnect = (io: Server, socket: Socket): void => {
  console.log('Déconnexion :', socket.id);
  state.users = state.users.filter((user) => user.socketId !== socket.id);
  state.usersSocket = state.usersSocket.filter((user) => user.socketId !== socket.id);
  io.emit('removeUser', socket.id);
};

export default disconnect;
