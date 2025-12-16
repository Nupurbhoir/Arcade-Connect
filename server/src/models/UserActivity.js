import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    username: { type: String, required: true },
    action: { type: String, required: true }, // 'login', 'logout', 'match_start', 'match_end', 'achievement_unlock', etc.
    timestamp: { type: Date, required: true, default: Date.now },
    metadata: {
      game: { type: String },
      lobbyId: { type: String },
      matchId: { type: String },
      sessionId: { type: String },
      duration: { type: Number },
      score: { type: Number },
      ip: { type: String },
      userAgent: { type: String },
      location: { type: String },
      device: { type: String },
    },
    sessionId: { type: String }, // For tracking session-based activities
  },
  { timestamps: true }
);

// Indexes for efficient queries
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });

const UserActivity = mongoose.models.UserActivity || mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
