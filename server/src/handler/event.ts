import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Server } from 'socket.io';

interface EventHandler {
  (io: Server, socket: any, ...args: any[]): void;
  name: string;
}

interface LoadedEvents {
  [key: string]: EventHandler;
}

let loadedEvents: LoadedEvents = {};

const loadEvents = (): LoadedEvents => {
  const eventsDir = join(__dirname, '../events');

  try {
    for (const file of readdirSync(eventsDir)) {
      if (file.endsWith('.js') && file !== 'index.js') {
        const eventModule = require(join(eventsDir, file));
        if (eventModule.default) {
          const eventName = file.replace('.js', '');
          const eventFn = eventModule.default as EventHandler;
          loadedEvents[eventName] = eventFn;
        }
      }
    }

    console.log(`${Object.keys(loadedEvents).length} events loaded!`);
  } catch (err) {
    console.error(`Error loading events: ${err}`);
  }

  return loadedEvents;
};

const registerEvents = (io: Server, socket: any): void => {
  for (const [eventName, handler] of Object.entries(loadedEvents)) {
    socket.on(eventName, (...args: any[]) => {
      handler(io, socket, ...args);
    });
  }
};

loadEvents();

export default registerEvents;
