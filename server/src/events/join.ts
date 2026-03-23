import { Socket, Server } from 'socket.io';
import { User } from '../types/types';
import state from '../types/state';

const join = (io: Server, socket: Socket, user: User): void => {
  if (state.users.some((u) => u.name === user.name)) {
    console.log('Utilisateur déjà connecté :', user);
  }

  user.socketId = socket.id;
  user.location = null;
  state.users.push(user);
  state.usersSocket.push({
    socket: socket,
    socketId: socket.id,
  });
  io.emit('updateUsers', state.users);
};

export default join;
