import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import UserStats from '../models/UserStats.js';
import { state } from '../state.js';

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

async function logUserActivity() {}

export async function register(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (mongoose.connection.readyState === 1) {
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'username already exists' });

    const user = await User.create({ username, passwordHash });

    try {
      await UserStats.updateOne(
        { userId: user._id.toString() },
        {
          $setOnInsert: {
            userId: user._id.toString(),
            userObjectId: user._id,
            username: user.username,
            lastUpdatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to create user stats:', err?.message || err);
    }

    const token = signToken({ userId: user._id.toString(), username: user.username });
    
    return res.json({ token, user: { id: user._id.toString(), username: user.username } });
  }

  if (state.users.has(username)) {
    return res.status(409).json({ error: 'username already exists' });
  }

  const user = { id: `mem_${username}`, username, passwordHash };
  state.users.set(username, user);

  const token = signToken({ userId: user.id, username: user.username });
  return res.json({ token, user: { id: user.id, username: user.username } });
}

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    // Update last seen and login stats (users collection only)
    await User.findByIdAndUpdate(user._id, {
      lastSeenAt: new Date(),
      lastLoginAt: new Date(),
      $inc: { loginCount: 1, 'stats.matchesPlayed': 0 },
    });

    try {
      await UserStats.updateOne(
        { userId: user._id.toString() },
        {
          $set: { username: user.username, userObjectId: user._id, lastUpdatedAt: new Date() },
          $setOnInsert: {
            userId: user._id.toString(),
            userObjectId: user._id,
            totals: { matchesPlayed: 0, wins: 0, losses: 0, highestScore: 0 },
          },
        },
        { upsert: true }
      );
    } catch (err) {
      console.error('Failed to upsert user stats:', err?.message || err);
    }

    const token = signToken({ userId: user._id.toString(), username: user.username });
    
    return res.json({ token, user: { id: user._id.toString(), username: user.username } });
  }

  const user = state.users.get(username);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const token = signToken({ userId: user.id, username: user.username });
  return res.json({ token, user: { id: user.id, username: user.username } });
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
