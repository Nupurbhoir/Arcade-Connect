import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import LobbyTime from './models/LobbyTime.js';
import UserStats from './models/UserStats.js';
import { state, publicLobby } from './state.js';

const LOBBY_SIZE = 10;
const DISCONNECT_GRACE_MS = 30_000;
const disconnectTimersByUserId = new Map();

function emitQueueUpdate(io) {
  const byGame = {};
  for (const p of state.queue) {
    byGame[p.game] = (byGame[p.game] || 0) + 1;
  }
  io.emit('queueUpdate', { length: state.queue.length, byGame });
}

function getLobbyChat(lobbyId) {
  const existing = state.lobbyChats.get(lobbyId);
  if (existing) return existing;
  const created = [];
  state.lobbyChats.set(lobbyId, created);
  return created;
}



function removeFromQueue(socketId) {
  const idx = state.queue.findIndex((p) => p.socketId === socketId);
  if (idx !== -1) state.queue.splice(idx, 1);
}

function lobbyNotification(io, lobbyId, { type, username, userId }) {
  io.to(lobbyId).emit('lobbyNotification', { type, username, userId, timestamp: new Date().toISOString() });
}

function scheduleLobbyRemoval(io, { lobbyId, userId }) {
  const existing = disconnectTimersByUserId.get(userId);
  if (existing) clearTimeout(existing);

  const t = setTimeout(() => {
    disconnectTimersByUserId.delete(userId);

    const lobby = state.lobbies.get(lobbyId);
    if (!lobby) return;

    const idx = lobby.players.findIndex((p) => p.userId === userId);
    if (idx === -1) return;

    if (lobby.players[idx].socketId) return;

    lobby.players.splice(idx, 1);

    if (lobby.players.length === 0) {
      state.lobbies.delete(lobbyId);
      return;
    }

    io.to(lobbyId).emit('lobbyState', publicLobby(lobby));
  }, DISCONNECT_GRACE_MS);

  disconnectTimersByUserId.set(userId, t);
}

function markDisconnectedFromLobby(io, socketId) {
  for (const [lobbyId, lobby] of state.lobbies.entries()) {
    const player = lobby.players.find((p) => p.socketId === socketId);
    if (!player) continue;

    player.socketId = null;
    io.to(lobbyId).emit('lobbyState', publicLobby(lobby));
    lobbyNotification(io, lobbyId, { type: 'leave', username: player.username, userId: player.userId });
    scheduleLobbyRemoval(io, { lobbyId, userId: player.userId });
    return;
  }
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    emitQueueUpdate(io);

    socket.on('joinQueue', (payload) => {
      const username = payload?.username || 'Player';
      const userId = payload?.userId || socket.id;
      const game = payload?.game || 'default';

      removeFromQueue(socket.id);

      state.queue.push({ socketId: socket.id, userId, username, game });
      emitQueueUpdate(io);

      const gameQueue = state.queue.filter((p) => p.game === game);
      if (gameQueue.length >= LOBBY_SIZE) {
        const kept = [];
        const selected = [];

        for (const p of state.queue) {
          if (p.game === game && selected.length < LOBBY_SIZE) {
            selected.push(p);
          } else {
            kept.push(p);
          }
        }

        state.queue = kept;
        const lobbyId = uuidv4();
        const lobby = {
          id: lobbyId,
          game,
          players: selected.map((p, idx) => ({
            socketId: p.socketId,
            userId: p.userId,
            username: p.username,
            team: idx < LOBBY_SIZE / 2 ? 'A' : 'B',
            ready: false,
          })),
          createdAt: new Date().toISOString(),
        };

        state.lobbies.set(lobbyId, lobby);

        for (const p of lobby.players) {
          const sock = io.sockets.sockets.get(p.socketId);
          if (sock) {
            sock.join(lobbyId);
            sock.emit('lobbyCreated', publicLobby(lobby));
          }
        }

        io.to(lobbyId).emit('lobbyState', publicLobby(lobby));
        emitQueueUpdate(io);
      }
    });

    socket.on('joinLobby', async ({ lobbyId, userId, username }) => {
      const lobby = state.lobbies.get(lobbyId);
      if (!lobby) {
        socket.emit('errorMessage', { message: 'Lobby not found' });
        return;
      }

      const player = lobby.players.find((p) => p.userId === userId);
      if (!player) {
        socket.emit('errorMessage', { message: 'Player not in lobby' });
        return;
      }

      const t = disconnectTimersByUserId.get(userId);
      if (t) {
        clearTimeout(t);
        disconnectTimersByUserId.delete(userId);
      }

      player.socketId = socket.id;
      if (username) player.username = username;

      socket.join(lobbyId);
      socket.emit('lobbyState', publicLobby(lobby));
      io.to(lobbyId).emit('lobbyState', publicLobby(lobby));

      lobbyNotification(io, lobbyId, { type: 'join', username: player.username, userId: player.userId });

      try {
        if (mongoose.connection.readyState === 1) {
          const doc = await LobbyTime.create({
            username: String(player.username || username || 'Player'),
            enteredAt: new Date(),
          });
          void doc;
        }
      } catch (err) {
        console.error('Failed to write lobby time entry:', err?.message || err);
      }

      try {
        const chat = getLobbyChat(lobbyId);
        socket.emit('lobbyChatHistory', { lobbyId, messages: chat });
      } catch {
        const chat = getLobbyChat(lobbyId);
        socket.emit('lobbyChatHistory', { lobbyId, messages: chat });
      }
    });

    socket.on('sendLobbyMessage', async ({ lobbyId, userId, username, text }) => {
      const lobby = state.lobbies.get(lobbyId);
      if (!lobby) return;

      const clean = String(text || '').trim();
      if (!clean) return;

      const safe = clean.slice(0, 500);

      const normalizedUserId = String(userId || '');
      const normalizedUsername = String(username || 'Player');

      const now = new Date().toISOString();
      const message = {
        id: uuidv4(),
        lobbyId,
        userId: normalizedUserId,
        username: normalizedUsername,
        text: safe,
        createdAt: now,
      };

      const chat = getLobbyChat(lobbyId);
      chat.push(message);
      if (chat.length > 60) chat.splice(0, chat.length - 60);

      io.to(lobbyId).emit('lobbyMessage', message);
    });

    socket.on('leaveQueue', () => {
      removeFromQueue(socket.id);
      emitQueueUpdate(io);
    });

    socket.on('toggleReady', ({ lobbyId }) => {
      const lobby = state.lobbies.get(lobbyId);
      if (!lobby) return;

      const player = lobby.players.find((p) => p.socketId === socket.id);
      if (!player) return;

      player.ready = !player.ready;

      io.to(lobbyId).emit('lobbyState', publicLobby(lobby));

      lobbyNotification(io, lobbyId, { type: player.ready ? 'ready' : 'unready', username: player.username, userId: player.userId });

      const allReady = lobby.players.length > 0 && lobby.players.every((p) => p.ready);
      if (allReady) {
        const startedAt = new Date();
        const gameKey = String(lobby.game || 'default');
        const matchPayload = {
          lobbyId,
          game: lobby.game,
          startedAt,
          players: lobby.players.map((p) => ({ userId: p.userId, username: p.username, team: p.team })),
        };

        if (mongoose.connection.readyState === 1) {
          const now = new Date();
          for (const p of lobby.players) {
            const id = String(p.userId || '');
            if (!id) continue;
            const oid = mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
            UserStats.updateOne(
              { userId: id },
              {
                $set: {
                  username: String(p.username || 'Player'),
                  ...(oid ? { userObjectId: oid } : {}),
                  lastUpdatedAt: now,
                },
                $setOnInsert: {
                  userId: id,
                  ...(oid ? { userObjectId: oid } : {}),
                  totals: { matchesPlayed: 0, wins: 0, losses: 0, highestScore: 0 },
                },
                $inc: {
                  'totals.matchesPlayed': 1,
                  [`games.${gameKey}.matchesPlayed`]: 1,
                },
              },
              { upsert: true }
            ).catch(() => {});
          }
        }

        state.matches.push({
          ...matchPayload,
          startedAt: startedAt.toISOString(),
        });

        io.to(lobbyId).emit('startGame', { lobbyId });
      }
    });

    socket.on('disconnect', () => {
      removeFromQueue(socket.id);
      markDisconnectedFromLobby(io, socket.id);
      emitQueueUpdate(io);
    });
  });

  return io;
}
