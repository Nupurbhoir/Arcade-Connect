# MongoDB Setup Guide

## Prerequisites
- MongoDB installed and running on your system
- OR MongoDB Atlas account (cloud option)

## Local MongoDB Setup

### 1. Install MongoDB
```bash
# macOS with Homebrew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

### 2. Create Environment File
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Update .env file
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/arcadeconnect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## MongoDB Atlas Setup (Cloud Option)

### 1. Create Atlas Account
Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.

### 2. Create Cluster
- Create a new free cluster (M0 tier)
- Choose a region closest to you

### 3. Configure Network Access
- Add your IP address to whitelist (0.0.0.0/0 for all IPs during development)
- Create database user with username and password

### 4. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string

### 5. Update .env file
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/arcadeconnect
```

## Data Models

The following collections will be created automatically:

### Users
- Authentication data
- Game statistics (wins, losses, K/D ratio)
- User preferences and settings
- Friends and blocked users
- Achievements

### Matches
- Match results and player performance
- Team compositions and scores
- Game events timeline

### GameSessions
- Single-player game sessions
- High scores and achievements
- Session duration and metadata

### Leaderboard
- Ranked player positions
- Game-specific leaderboards
- Regional rankings

### UserActivity
- Login/logout tracking
- Match participation
- Achievement unlocks
- User behavior analytics

## Verification

Once MongoDB is configured, the application will automatically:

1. Connect to the database on startup
2. Create collections as needed
3. Save all user data, matches, and statistics
4. Provide persistent data storage

You can verify the connection by checking the server logs:
```bash
npm run dev
```

You should see: `MongoDB connected (arcadeconnect)`

## Data Persistence Features

- **User Accounts**: All registrations and logins saved
- **Match History**: Every match recorded with player stats
- **Leaderboards**: Automatic ranking updates
- **User Statistics**: Win rates, K/D ratios, high scores
- **Activity Tracking**: Login times, match participation
- **Achievement System**: Unlock tracking and timestamps

All data is now persistent and will survive server restarts!
