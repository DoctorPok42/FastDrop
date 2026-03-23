import { Socket, Server } from 'socket.io';
import { User } from '../types/types';
import state from '../types/state';
import { isUserNear } from '../utils';

const updatePrivacyLevel = (io: Server, socket: Socket, user: User): void => {
    if (user.privacyLevel === '2') {
      let findeUserToUpdate = state.users.find((u) => u.socketId === socket.id);

      if (findeUserToUpdate) {
        findeUserToUpdate.privacyLevel = '2';
        findeUserToUpdate.location = user.location;
      }

      state.users = state.users.map((u) => {
        if (u.socketId === socket.id) {
          u.privacyLevel = '2';
          u.location = user.location;
        }
        return u;
      });

      if (user.location !== null && user.location !== undefined) {
        let nearbyUsers = state.users.filter(
          (u) => isUserNear(u.location, user.location) && u.privacyLevel === '2'
        );

        const otherUsers = state.users.filter(
          (u) =>
            !nearbyUsers.map((u) => u.socketId).includes(u.socketId) &&
            u.privacyLevel !== '2'
        );
        io.emit('updateUsers', otherUsers);

        const targetUsers = nearbyUsers.map((u) => u.socketId);
        targetUsers.forEach((targetUserId) => {
          const targetUser = state.usersSocket.find((socket) => socket.socketId === targetUserId);

          if (targetUser) {
            targetUser.socket.emit('updateUsers', nearbyUsers);
          }
        });
      }
    } else if (user.privacyLevel === '1') {
      state.users = state.users.map((u) => {
        if (u.socketId === socket.id) {
          u.privacyLevel = '1';
        }
        return u;
      });

      socket.emit('updateUsers', state.users.filter((u) => u.privacyLevel === '1'));
      const otherUsers = state.users.filter(
        (u) => u.socketId !== socket.id && u.privacyLevel !== '1'
      );
      otherUsers.forEach((otherUser) => {
        const targetUser = state.usersSocket.find((socket) => socket.socketId === otherUser.socketId);

        if (targetUser) {
          targetUser.socket.emit('removeUser', socket.id);
        }
      });
    } else if (user.privacyLevel === '3') {
      state.users = state.users.map((u) => {
        if (u.socketId === socket.id) {
          u.privacyLevel = '3';
        }
        return u;
      });

      socket.emit('updateUsers', state.users.filter((u) => u.privacyLevel === '3'));
      const otherUsers = state.users.filter(
        (u) => u.socketId !== socket.id && u.privacyLevel !== '3'
      );
      otherUsers.forEach((otherUser) => {
        const targetUser = state.usersSocket.find((socket) => socket.socketId === otherUser.socketId);

        if (targetUser) {
          targetUser.socket.emit('removeUser', socket.id);
        }
      });
    }
};

export default updatePrivacyLevel;
