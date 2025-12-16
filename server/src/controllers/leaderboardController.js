import mongoose from 'mongoose';
import UserStats from '../models/UserStats.js';
import { state } from '../state.js';

export async function getLeaderboard(req, res) {
  const limit = Math.min(50, Math.max(5, Number(req.query.limit || 25)));
  const page = Math.max(1, Number(req.query.page || 1));
  const skip = (page - 1) * limit;
  const q = String(req.query.q || '').trim();
  const region = String(req.query.region || '').trim();
  const rank = String(req.query.rank || '').trim();
  const sort = String(req.query.sort || 'matchesPlayed').trim();
  const order = String(req.query.order || 'desc').trim().toLowerCase() === 'asc' ? 1 : -1;

  try {
    if (mongoose.connection.readyState === 1) {
      try {
        // Seed demo leaderboard players into Mongo (safe: inserts only if missing)
        // Ensures Atlas/leaderboard always shows data even before any real matches are played.
        if (page === 1) {
          const now = new Date();
          await UserStats.bulkWrite(
            [
              {
                updateOne: {
                  filter: { userId: 'ex1' },
                  update: { $setOnInsert: { userId: 'ex1', username: 'Phoenix', rank: 'Diamond', region: 'NA', totals: { matchesPlayed: 342, wins: 210, losses: 132, highestScore: 980 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex2' },
                  update: { $setOnInsert: { userId: 'ex2', username: 'Viper', rank: 'Platinum', region: 'EU', totals: { matchesPlayed: 298, wins: 171, losses: 127, highestScore: 940 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex3' },
                  update: { $setOnInsert: { userId: 'ex3', username: 'Shadow', rank: 'Gold', region: 'ASIA', totals: { matchesPlayed: 276, wins: 150, losses: 126, highestScore: 910 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex4' },
                  update: { $setOnInsert: { userId: 'ex4', username: 'Blaze', rank: 'Gold', region: 'Global', totals: { matchesPlayed: 254, wins: 129, losses: 125, highestScore: 890 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex5' },
                  update: { $setOnInsert: { userId: 'ex5', username: 'Storm', rank: 'Silver', region: 'EU', totals: { matchesPlayed: 231, wins: 115, losses: 116, highestScore: 870 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex6' },
                  update: { $setOnInsert: { userId: 'ex6', username: 'Frost', rank: 'Silver', region: 'NA', totals: { matchesPlayed: 209, wins: 104, losses: 105, highestScore: 850 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex7' },
                  update: { $setOnInsert: { userId: 'ex7', username: 'Ghost', rank: 'Bronze', region: 'ASIA', totals: { matchesPlayed: 187, wins: 93, losses: 94, highestScore: 820 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex8' },
                  update: { $setOnInsert: { userId: 'ex8', username: 'Neon', rank: 'Bronze', region: 'Global', totals: { matchesPlayed: 165, wins: 82, losses: 83, highestScore: 800 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex9' },
                  update: { $setOnInsert: { userId: 'ex9', username: 'Echo', rank: 'Unranked', region: 'Global', totals: { matchesPlayed: 143, wins: 71, losses: 72, highestScore: 780 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
              {
                updateOne: {
                  filter: { userId: 'ex10' },
                  update: { $setOnInsert: { userId: 'ex10', username: 'Nova', rank: 'Unranked', region: 'NA', totals: { matchesPlayed: 121, wins: 62, losses: 59, highestScore: 760 }, lastUpdatedAt: now } },
                  upsert: true,
                },
              },
            ],
            { ordered: false }
          );
        }
      } catch {
        // ignore seed failures
      }

      const pipeline = [];

      if (q) {
        pipeline.push({ $match: { username: { $regex: q, $options: 'i' } } });
      }

      pipeline.push({
        $addFields: {
          matchesPlayed: { $ifNull: ['$totals.matchesPlayed', 0] },
          wins: { $ifNull: ['$totals.wins', 0] },
          losses: { $ifNull: ['$totals.losses', 0] },
          highestScore: { $ifNull: ['$totals.highestScore', 0] },
        },
      });

      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'user',
        },
      });
      pipeline.push({ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } });

      pipeline.push({
        $addFields: {
          rank: { $ifNull: ['$user.rank', { $ifNull: ['$rank', 'Unranked'] }] },
          region: { $ifNull: ['$user.region', { $ifNull: ['$region', 'Global'] }] },
        },
      });

      if (region) {
        pipeline.push({ $match: { region } });
      }
      if (rank) {
        pipeline.push({ $match: { rank } });
      }

      const sortMap = {
        matchesPlayed: { matchesPlayed: order, username: 1 },
        username: { username: order, matchesPlayed: -1 },
        rank: { rank: order, matchesPlayed: -1, username: 1 },
        region: { region: order, matchesPlayed: -1, username: 1 },
      };
      const sortStage = sortMap[sort] || sortMap.matchesPlayed;

      pipeline.push({ $sort: sortStage });
      pipeline.push({
        $facet: {
          items: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                userId: '$userId',
                username: '$username',
                matchesPlayed: '$matchesPlayed',
                rank: '$rank',
                region: '$region',
                wins: '$wins',
                losses: '$losses',
                highestScore: '$highestScore',
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      });

      const out = await UserStats.aggregate(pipeline);
      const items = (out?.[0]?.items || []).map((row, idx) => ({ position: skip + idx + 1, ...row }));
      const total = Number(out?.[0]?.total?.[0]?.count || 0);
      const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : 1;

      return res.json({ leaderboard: items, page, limit, total, totalPages });
    }

    const counts = new Map();
    for (const m of state.matches) {
      for (const p of m.players || []) {
        const key = String(p.userId);
        const existing = counts.get(key) || {
          userId: key,
          username: p.username || 'Player',
          matchesPlayed: 0,
        };
        existing.matchesPlayed += 1;
        if (!existing.username && p.username) existing.username = p.username;
        counts.set(key, existing);
      }
    }

    const usersById = new Map();
    for (const u of state.users.values()) {
      usersById.set(String(u.id), u);
    }

    let rows = Array.from(counts.values()).map((r) => {
      return {
        userId: r.userId,
        username: r.username,
        rank: 'Unranked',
        region: 'Global',
        matchesPlayed: r.matchesPlayed,
        wins: 0,
        losses: 0,
        highestScore: 0,
      };
    });

    if (q) rows = rows.filter((r) => String(r.username || '').toLowerCase().includes(q.toLowerCase()));
    rows.sort((a, b) => {
      if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
      return String(a.username).localeCompare(String(b.username));
    });

    const total = rows.length;
    const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : 1;
    rows = rows.slice(skip, skip + limit).map((r, idx) => ({ position: skip + idx + 1, ...r }));

    return res.json({ leaderboard: rows, page, limit, total, totalPages });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to load leaderboard' });
  }
}
