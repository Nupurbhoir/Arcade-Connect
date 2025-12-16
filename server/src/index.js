import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { initSocket } from './socket.js';
import { connectMongo } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = Number(process.env.PORT || 3001);

const app = createApp();
const server = http.createServer(app);

initSocket(server);

await connectMongo();

server.listen(PORT, () => {
  // Intentionally no extra logging framework setup here.
  console.log(`Server listening on http://localhost:${PORT}`);
});
