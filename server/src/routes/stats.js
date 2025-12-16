import express from 'express';
import { getUserStats, updateMatchStats, saveGameSession } from '../controllers/statsController.js';
import { getLeaderboard as getMongoLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

// Get user statistics and profile data
router.get('/user/:userId', getUserStats);

// Update match statistics after game ends
router.put('/match/:matchId', updateMatchStats);

// Get leaderboard for specific game/region
router.get('/leaderboard', getMongoLeaderboard);

// Save single-player game session
router.post('/session', saveGameSession);

export default router;
