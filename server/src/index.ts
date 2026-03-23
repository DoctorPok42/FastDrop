import { createServer } from 'node:http';
import { Server } from 'socket.io';
import registerEvents from './handler/event';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://fastdrop.doctorpok.io'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 1e9, // 1 GB
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  upgradeTimeout: 10000,
  perMessageDeflate: {
    threshold: 1024,
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
  },
});

const port = 3001;

io.on('connection', (socket) => {
  console.log('Nouvelle connexion :', socket.id);

  registerEvents(io, socket);
});

httpServer.listen(port, () => {
  console.log(`Serveur Socket.io en cours d'exécution sur le port ${port}`);
});

export default httpServer;

