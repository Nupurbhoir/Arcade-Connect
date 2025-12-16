import mongoose from 'mongoose';
import User from '../models/User.js';
import { state } from '../state.js';

function findMemUserById(id) {
  for (const u of state.users.values()) {
    if (u.id === id) return u;
  }
  return null;
}

function ensureMemUserFromToken({ id, username }) {
  if (!id || !username) return null;
  const existing = state.users.get(username);
  if (existing) return existing;

  const user = {
    id,
    username,
    passwordHash: '',
    rank: 'Unranked',
    region: 'Global',
  };

  state.users.set(username, user);
  return user;
}

export async function getMe(req, res) {
  const id = req.user?.id;
  const username = req.user?.username;

  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        rank: user.rank,
        region: user.region,
      },
    });
  }

  const u = findMemUserById(id);
  if (!u) {
    if (id && username) {
      return res.json({ user: { id, username, rank: 'Unranked', region: 'Global' } });
    }
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: { id: u.id, username: u.username, rank: u.rank || 'Unranked', region: u.region || 'Global' },
  });
}

export async function updateMe(req, res) {
  const id = req.user?.id;
  const username = req.user?.username;
  const { rank, region } = req.body || {};

  if (mongoose.connection.readyState === 1) {
    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(rank !== undefined ? { rank } : {}),
        ...(region !== undefined ? { region } : {}),
      },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        rank: user.rank,
        region: user.region,
      },
    });
  }

  const u = findMemUserById(id);
  const memUser = u || ensureMemUserFromToken({ id, username });
  if (!memUser) return res.status(404).json({ error: 'User not found' });

  if (rank !== undefined) memUser.rank = rank;
  if (region !== undefined) memUser.region = region;

  return res.json({
    user: {
      id: memUser.id,
      username: memUser.username,
      rank: memUser.rank || 'Unranked',
      region: memUser.region || 'Global',
    },
  });
}
