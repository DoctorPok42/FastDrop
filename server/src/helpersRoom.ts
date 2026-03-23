import state from './types/state';

export const sendToRoomMembers = (targetUserId: string, sendEvent: (roomId: string) => void): void => {
  const userRoom = Array.from(state.rooms.entries()).find(([roomId, users]) => {
    return users.some((user) => user.socketId === targetUserId);
  });

  if (userRoom) {
    const [roomId] = userRoom;
    sendEvent(roomId);
  }
};
