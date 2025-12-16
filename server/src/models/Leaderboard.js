import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    username: { type: String, required: true },
    game: { type: String, required: true },
    gameMode: { type: String, default: 'classic' },
    region: { type: String, default: 'Global' },
    rank: { type: Number, required: true },
    score: { type: Number, required: true },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      avgKills: { type: Number, default: 0 },
      avgDeaths: { type: Number, default: 0 },
      kdr: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
    },
    season: { type: String, default: 'current' },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
leaderboardEntrySchema.index({ game: 1, gameMode: 1, region: 1, rank: 1 });
leaderboardEntrySchema.index({ game: 1, score: -1 });
leaderboardEntrySchema.index({ userId: 1, game: 1 });

const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardEntrySchema);

export default Leaderboard;
