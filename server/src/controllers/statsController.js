import mongoose from 'mongoose';
import User from '../models/User.js';
import UserStats from '../models/UserStats.js';

export async function getUserStats(req, res) {
  const { userId } = req.params;
  
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) return res.status(404).json({ error: 'User not found' });

      let stats = null;
      try {
        stats = await UserStats.findOne({ userId: String(userId) }).lean();
      } catch {
        stats = null;
      }

      return res.json({
        user,
        stats,
      });
    }
    
    return res.status(503).json({ error: 'Database not available' });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMatchStats(req, res) {
  // Updates the "user stats" collection only.
  // Expected body: { game, winningTeam, players: [{ userId, username, team, stats: { score } }] }
  const { game, winningTeam, players } = req.body || {};
  const gameKey = String(game || 'default');

  if (!Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: 'players is required' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not available' });
  }

  const now = new Date();
  const ops = [];

  for (const p of players) {
    const id = String(p?.userId || '');
    if (!id) continue;

    const oid = mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
    const username = String(p?.username || 'Player');
    const team = String(p?.team || '');
    const won = winningTeam !== undefined && winningTeam !== null ? team === String(winningTeam) : null;
    const score = Number(p?.stats?.score);
    const hasScore = Number.isFinite(score);

    const inc = {};
    if (won === true) {
      inc['totals.wins'] = 1;
      inc[`games.${gameKey}.wins`] = 1;
    } else if (won === false) {
      inc['totals.losses'] = 1;
      inc[`games.${gameKey}.losses`] = 1;
    }

    const update = {
      $set: { username, ...(oid ? { userObjectId: oid } : {}), lastUpdatedAt: now },
      $setOnInsert: {
        userId: id,
        ...(oid ? { userObjectId: oid } : {}),
        totals: { matchesPlayed: 0, wins: 0, losses: 0, highestScore: 0 },
      },
    };
    if (Object.keys(inc).length) update.$inc = inc;

    if (hasScore) {
      update.$max = {
        'totals.highestScore': score,
        [`games.${gameKey}.highestScore`]: score,
      };
    }

    ops.push(UserStats.updateOne({ userId: id }, update, { upsert: true }));
  }

  try {
    await Promise.all(ops);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to update user stats:', err?.message || err);
    return res.status(500).json({ error: 'Failed to update stats' });
  }
}

export async function getLeaderboard(req, res) {
  return res.json({ leaderboard: [] });
}

export async function saveGameSession(req, res) {
  // Updates the "user stats" collection only.
  // Expected body: { userId, username, game, score, won }
  const { userId, username, game, score, won } = req.body || {};
  const id = String(userId || '');
  const gameKey = String(game || 'default');
  const cleanUsername = String(username || 'Player');
  const numericScore = Number(score);
  const hasScore = Number.isFinite(numericScore);

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not available' });
  }

  if (!id) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const oid = mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
  const now = new Date();

  const inc = {};
  if (won === true) {
    inc['totals.wins'] = 1;
    inc[`games.${gameKey}.wins`] = 1;
  } else if (won === false) {
    inc['totals.losses'] = 1;
    inc[`games.${gameKey}.losses`] = 1;
  }

  const update = {
    $set: { username: cleanUsername, ...(oid ? { userObjectId: oid } : {}), lastUpdatedAt: now },
    $setOnInsert: {
      userId: id,
      ...(oid ? { userObjectId: oid } : {}),
      totals: { matchesPlayed: 0, wins: 0, losses: 0, highestScore: 0 },
    },
  };

  if (Object.keys(inc).length) update.$inc = inc;
  if (hasScore) {
    update.$max = {
      'totals.highestScore': numericScore,
      [`games.${gameKey}.highestScore`]: numericScore,
    };
  }

  try {
    await UserStats.updateOne({ userId: id }, update, { upsert: true });
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to save game session stats:', err?.message || err);
    return res.status(500).json({ error: 'Failed to update stats' });
  }
}
