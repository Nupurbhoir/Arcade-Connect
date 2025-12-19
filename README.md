# ArcadeConnect — Complete Project Documentation

## 1. Project Title

ArcadeConnect — Real-Time Matchmaking and Game Lobby System

## 2. Context and Problem Statement

Online multiplayer games depend heavily on fast matchmaking and real-time synchronized lobbies.

If there is:

- Slow matchmaking
- Delay in lobby updates
- Players not seeing each other join/leave
- Sync issues in “Ready Up” flow

…the entire gaming experience breaks. Players lose trust and quit.

Rural areas, slow networks, and poor synchronization make this worse.

Most gaming platforms fail because they don’t handle real-time state well.

## 3. Proposed Solution — ArcadeConnect

ArcadeConnect is a real-time, MERN-stack based matchmaking and lobby management system.

The system:

- Manages player queues
- Instantly forms teams
- Synchronizes lobby players
- Handles ready states
- Initiates match start
- Displays a premium UI inspired by casino-style lobbies and Valorant

Everything runs in real time using Socket.IO with minimal delay.

ArcadeConnect is suitable for:

- Battle Royale games
- 5v5 team shooters
- Racing games
- Mobile esports
- Multiplayer arcade games

## 4. Tech Stack

### Frontend (React)

- Vite + React (JSX, no TypeScript)
- React Router
- Socket.IO Client
- Framer Motion (animations)
- Glassmorphism + neon/casino-inspired aesthetics

### Backend (Node / Express)

- REST API
- Authentication (JWT)
- Queue Management
- Lobby Management
- Real-time communication via Socket.IO

### Database (MongoDB)

ArcadeConnect uses MongoDB for persistence of **only the essential collections**:

- `users` (registered accounts and profile fields)
- `lobby time` (who entered the lobby and when)
- `user stats` (persistent wins/losses/highest score/matches played; also powers the leaderboard)

Real-time lobby state, chat, and match history are managed **in-memory** on the server for the demo workflow.

### Tools

- Postman (API testing)
- MongoDB Atlas (cloud DB)
- Vite Dev Server (frontend)

## 4.1 Default Ports / URLs

- **Server (Express + Socket.IO):** `http://localhost:3001`
- **Client (Vite):** `http://localhost:5173`
- **Client API Base URL:** configured via `client/.env` (`VITE_SERVER_URL`)

## 5. Core Features

### A. Matchmaking Queue

- Player enters queue
- Queue statistics update in real time
- Estimated wait time
- Once enough players join, the system auto-creates a lobby
- Smooth UI animations and premium feel

### B. Real-Time Lobby

- Shows all players who joined
- Each player has a Ready Up button
- Instant readiness sync
- All ready triggers match start
- Real-time lobby state sync (`lobbyState`) and activity notifications (`lobbyNotification`)

### C. Team Formation

- Automatically assigns players
- Lobby is created dynamically
- Shows presence instantly with animated tiles

### D. Authentication

- JWT login and signup
- Player profile fields (rank/region) stored on the user profile
- Persistent player stats stored in MongoDB `user stats`

### F. Teacher Demo Lobby

- Dedicated route: `/lobby-demo`
- “START DEMO” auto-fills two teams and starts a countdown
- Demo pulls player names from MongoDB leaderboard (`/api/leaderboard`) when available (falls back to local demo names)

### E. Premium UI

Inspired by casino-style lobbies and Valorant/Riot lobby patterns:

- Glassmorphism + neon gradients
- Animated ready transitions
- Floating particles and glow accents

- Hover animations:

- Framer Motion scale + fade

## 6. Proposed Folder Structure

```
arcadeconnect/

  server/
    src/
      index.js
      app.js
      socket.js
      routes/
        authRoutes.js
        queueRoutes.js
      controllers/
      middleware/
      models/
        User.js
        Lobby.js
    .env

  client/
    src/
      pages/
        GameSelection.jsx
        MatchmakingQueue.jsx
        Lobby.jsx
      components/
        PlayerCard.jsx
      utils/
        socket.js
      App.jsx
      main.jsx
```

## 7. Backend Functional Requirements

### A. REST APIs

- Register player
- Login player
- Update skill level / rank
- Join queue
- Leave queue
- Fetch match/lobby history

### B. Socket.IO Real-Time Events

| Event | Description |
| --- | --- |
| `joinQueue` | Player enters matchmaking |
| `queueUpdate` | Broadcast updated queue count |
| `lobbyCreated` | Fired when enough players queue |
| `lobbyState` | Sync lobby players and ready states |
| `toggleReady` | Player toggles ready |
| `startGame` | Triggered when all ready |

## 7.1 Main REST API Routes

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- **Leaderboard (MongoDB-backed)**
  - `GET /api/leaderboard?limit=&page=&q=&region=&rank=&sort=&order=`
- **Stats (MongoDB-backed)**
  - `GET /api/stats/user/:userId` (returns user profile + user stats)
  - `GET /api/stats/leaderboard` (same data as `/api/leaderboard`)
  - `POST /api/stats/session` (updates `user stats` only)
- **Matches (in-memory)**
  - `GET /api/matches/me`

## 8. Frontend Functional Requirements

### GameSelection Page

- Choose a game
- Start matchmaking
- Centered, clean UI

### Matchmaking Queue Page

UI includes:

- Neon gradients
- Glass cards
- Floating particles
- Animated “Join Matchmaking” button

Live features:

- Real-time queue length
- Estimated wait time
- Auto navigation to lobby on match found

### Lobby Page

- Animated player tiles
- Ready state glow
- Real-time ready updates
- Team lobby layout

## 9. How Matchmaking Works Internally

### Step 1 — Player clicks “Join Queue”

Frontend sends:

```js
socket.emit("joinQueue", playerObj);
```

### Step 2 — Server adds player to queue

```js
queue.push(player);
```

### Step 3 — Broadcast queue size

```js
io.emit("queueUpdate", { length: queue.length });
```

### Step 4 — When enough players → create lobby

```js
lobby = { players };
```

### Step 5 — Emit lobbyCreated to all players in the lobby

```js
socket.emit("lobbyCreated", { lobbyId, players });
```

### Step 6 — Players toggle ready

```js
socket.emit("toggleReady");
```

### Step 7 — When all ready → start game

```js
io.emit("startGame");
```

All state transitions are real time.

## 10. UI Design Overview

### Visual Style Guide

- Dark esports gradient:

```css
background: linear-gradient(135deg, #050611, #1b1d33);
```

- Neon purple/blue highlights:

- `#7d41ff`
- `#4cc9f0`

- Glassmorphism cards:

```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(15px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

- Glowing borders when ready:

- Green neon: `#00ff99`

- Hover animations:

- Framer Motion scale + fade

## 11. Running the Project

Install dependencies (from the project root):

```bash
npm install
```

Run both client + server together:

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:server
npm run dev:client
```

### Environment Setup

- **Server env:** copy `server/.env.example` to `server/.env` and set:
  - `MONGO_URI` (MongoDB Atlas connection string)
  - `JWT_SECRET`
  - `PORT` (default `3001`)
  - `CLIENT_ORIGIN` (default `http://localhost:5173`)
- **Client env:** copy `client/.env.example` to `client/.env` and set:
  - `VITE_SERVER_URL=http://localhost:3001`

## 12. Testing with Postman

Endpoints to test manually:

```
POST /api/auth/register
POST /api/auth/login
GET  /api/leaderboard
GET  /api/stats/leaderboard
GET  /api/stats/user/:userId
GET  /api/matches/me
```

For real-time testing, use a Socket.IO-capable client (or the browser).

## 13. MongoDB Atlas Integration

Put your connection string into `server/.env`:

```bash
MONGO_URI="your-atlas-uri-here"
JWT_SECRET="strongsecretkey"
```

### MongoDB Collections Used (Important)

ArcadeConnect is intentionally configured to keep MongoDB usage minimal.

- **`users`**
  - Stores registered accounts and profile fields.
- **`lobby time`**
  - Written when a player joins a lobby (stores `username` and `enteredAt`).
- **`user stats`**
  - Stores persistent stats keyed by `userId` **as a string** (supports demo users as well).
  - `totals.matchesPlayed`, `totals.wins`, `totals.losses`, `totals.highestScore`
  - Used by the leaderboard endpoint.

**Leaderboard seeding:** on first-page leaderboard requests, the server inserts demo users (`ex1`…`ex10`) into `user stats` using safe upserts (won’t overwrite real users).

### How Stats Are Saved in MongoDB (Flow)

- **On register/login**
  - `users` is created/updated.
  - `user stats` is upserted for that `userId` (string) so stats exist immediately.
- **On lobby join**
  - `lobby time` gets a new document with `username` + `enteredAt`.
- **On match start (all ready)**
  - Server increments `totals.matchesPlayed` for all lobby players in `user stats`.

## 14. Deliverables

- Fully working MERN system
- Real-time matchmaking
- Real-time lobby system
- Premium UI with animations
- Match start logic
- MongoDB-backed leaderboard + persistent user stats
- Dedicated teacher demo lobby (`/lobby-demo`)

## 15. Next Possible Upgrades

- 5v5 esports team layout
- Sound effects (ready chime)
- Animated loading screen
- AI-based matchmaking balancer
- Tournament mode (brackets / seasons)
- Persist match history in MongoDB (optional; currently in-memory)
- Admin dashboard for colleges/events
- Anti-cheat and ping sync

- 
here are few image of my ui:
<img width="1470" height="836" alt="Screenshot 2025-12-19 at 11 53 02 PM" src="https://github.com/user-attachments/assets/13820f0e-b394-440a-8b37-b78e8a09e8f7" />

<img width="1469" height="832" alt="Screenshot 2025-12-19 at 11 53 21 PM" src="https://github.com/user-attachments/assets/50461070-0ae3-46ab-a082-e61e19c6cbe5" />
<img width="1470" height="834" alt="Screenshot 2025-12-19 at 11 53 45 PM" src="https://github.com/user-attachments/assets/968dfb75-48ce-4a15-b63d-3fe0069f95a2" />
<img width="1470" height="833" alt="Screenshot 2025-12-19 at 11 54 06 PM" src="https://github.com/user-attachments/assets/93fa6e24-226e-4118-ae79-4c2fa399751a" />
<img width="1468" height="833" alt="Screenshot 2025-12-19 at 11 54 24 PM" src="https://github.com/user-attachments/assets/569d5412-5bd0-4d68-85fc-83dd890969b9" />
<img width="1469" height="834" alt="Screenshot 2025-12-19 at 11 54 44 PM" src="https://github.com/user-attachments/assets/7c31b189-6843-44d1-a84a-3dd00add8a07" />




