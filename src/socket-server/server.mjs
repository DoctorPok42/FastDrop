import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

const port = 3001;

var users = []

var usersSocket = []

var filesStorage = []

const isUserNear = (location1, location2) => {
  if ((location1 === null || location1 === undefined) || (location2 === null || location2 === undefined)) {
    return false;
  }

  const distanceThreshold = 10;
  const distance = Math.sqrt(
    Math.pow(location1.latitude - location2.latitude, 2) +
    Math.pow(location1.longitude - location2.longitude, 2)
  );

  return distance < distanceThreshold;
}

io.on('connection', (socket) => {
  console.log('Nouvelle connexion :', socket.id);

  socket.on('disconnect', () => {
    console.log('Déconnexion :', socket.id);
    users = users.filter((user) => user.socketId !== socket.id);
    usersSocket = usersSocket.filter((user) => user.sokedId !== socket.id);
    io.emit('removeUser', socket.id);
  });

  socket.on('join', (user) => {
    if (Object.values(users).includes((u) => u.name === user.name)) {
      console.log('Utilisateur déjà connecté :', user);
    }

    user.socketId = socket.id;
    user.location = null;
    users.push(user);
    usersSocket.push({
      socket: socket,
      sokedId: socket.id
    });
    io.emit('updateUsers', users);
  });

  socket.on('updatePrivacyLevel', (user) => {
    if (user.privacyLevel === '2') {
      var findeUserToUpdate = users.find((u) => u.socketId === socket.id);

      if (findeUserToUpdate) {
        findeUserToUpdate.privacyLevel = '2';
        findeUserToUpdate.location = user.location;
      }

      users = users.map((u) => {
        if (u.socketId === socket.id) {
          u.privacyLevel = '2';
          u.location = user.location;
        }
        return u;
      });


      if (user.location !== null && user.location !== undefined) {
        var nearbyUsers = users.filter((u) => isUserNear(u.location, user.location) && u.privacyLevel === '2');

        const otherUsers = users.filter((u) => u.socketId !== nearbyUsers.map((u) => u.socketId) && u.privacyLevel !== '2');
        io.emit('updateUsers', otherUsers);

        const targetUsers = nearbyUsers.map((u) => u.socketId);
        targetUsers.forEach((targetUserId) => {
          const targetUser = usersSocket.find((socket) => socket.sokedId === targetUserId);

          if (targetUser) {
            targetUser.socket.emit('updateUsers', nearbyUsers);
          }
        });
      }
    }

    else if (user.privacyLevel === '1') {
      users = users.map((u) => {
        if (u.socketId === socket.id) {
          u.privacyLevel = '1';
        }
        return u;
      });

      socket.emit('updateUsers', users.filter((u) => u.privacyLevel === '1'));
      const otherUsers = users.filter((u) => u.socketId !== socket.id && u.privacyLevel !== '1');
      otherUsers.forEach((otherUser) => {
        const targetUser = usersSocket.find((socket) => socket.sokedId === otherUser.socketId);

        if (targetUser) {
          targetUser.socket.emit('removeUser', socket.id);
        }
      });
    }

    else if (user.privacyLevel === '3') {
      users = users.map((u) => {
        if (u.socketId === socket.id) {
          u.privacyLevel = '3';
        }
        return u;
      });

      socket.emit('updateUsers', users.filter((u) => u.privacyLevel === '3'));
      const otherUsers = users.filter((u) => u.socketId !== socket.id && u.privacyLevel !== '3');
      otherUsers.forEach((otherUser) => {
        const targetUser = usersSocket.find((socket) => socket.sokedId === otherUser.socketId);

        if (targetUser) {
          targetUser.socket.emit('removeUser', socket.id);
        }
      });
    }
  });

  socket.on('fileUploadLarge', (file, fileName, targetUserId, username, filePosition, fileLength) => {
    filesStorage.push({
      file: file,
      fileName: fileName,
      targetUserId: targetUserId,
      username: username,
      checked: true,
    })

    if (filePosition + 1 == fileLength) {
      console.log('fileUploadLargeEnd', filesStorage.map((file) => file.fileName));
      const targetUser = usersSocket.find((socket) => socket.sokedId === targetUserId);

      if (targetUser) {
        const file = filesStorage.filter((file) => file.targetUserId === targetUserId && file.username === username);
        filesStorage = filesStorage.filter((file) => file.targetUserId !== targetUserId);
        targetUser.socket.emit('fileDownloadLarge', file, username);
      }
    }
  });

  socket.on('fileUpload', (file, fileName, targetUserId, username) => {
    console.log('fileUpload', fileName, targetUserId);
    const targetUser = usersSocket.find((socket) => socket.sokedId === targetUserId);

    if (targetUser) {
      targetUser.socket.emit('fileDownload', file, fileName, username);
    }
  });

  socket.on('textUpload', (text, targetUserId, username) => {
    console.log('textUpload', text, targetUserId);
    const targetUser = usersSocket.find((socket) => socket.sokedId === targetUserId);

    if (targetUser) {
      targetUser.socket.emit('textDownload', text, username);
    }
  });

  socket.on('urlUpload', (url, targetUserId, username) => {
    console.log('urlUpload', url, targetUserId);
    const targetUser = usersSocket.find((socket) => socket.sokedId === targetUserId);

    if (targetUser) {
      targetUser.socket.emit('urlDownload', url, username);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Serveur Socket.io en cours d\'exécution sur le port ${port}`);
});
