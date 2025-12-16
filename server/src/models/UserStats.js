import mongoose from 'mongoose';

const perGameSchema = new mongoose.Schema(
  {
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const userStatsSchema = new mongoose.Schema(
  {
    // String userId so we can persist stats for demo users too (ex: "ex1", "demo1", "mem_*", etc.)
    userId: { type: String, required: true, unique: true, index: true },
    // Optional ObjectId reference when userId is a real Mongo ObjectId
    userObjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    username: { type: String, required: true, index: true },

    // Stored for non-User/demo players (and as fallback if userObjectId is not available)
    rank: { type: String, default: null },
    region: { type: String, default: null },

    totals: {
      matchesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
    },

    // Map keyed by game string (e.g., tactical, battle, etc.)
    games: { type: Map, of: perGameSchema, default: {} },

    lastUpdatedAt: { type: Date, default: () => new Date(), index: true },
  },
  {
    collection: 'user stats',
    timestamps: true,
  }
);

userStatsSchema.index({ username: 1 });
userStatsSchema.index({ userObjectId: 1 });

const UserStats = mongoose.models.UserStats || mongoose.model('UserStats', userStatsSchema);
export default UserStats;
