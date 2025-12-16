import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: null },
    rank: { type: String, default: 'Unranked' },
    region: { type: String, default: 'Global' },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      matchesWon: { type: Number, default: 0 },
      matchesLost: { type: Number, default: 0 },
      totalKills: { type: Number, default: 0 },
      totalDeaths: { type: Number, default: 0 },
      totalAssists: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      kdr: { type: Number, default: 0 },
    },
    preferences: {
      musicEnabled: { type: Boolean, default: true },
      sfxEnabled: { type: Boolean, default: true },
      notificationsEnabled: { type: Boolean, default: true },
      theme: { type: String, default: 'dark' },
    },
    achievements: [{
      type: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed },
    }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastSeenAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Calculate derived fields before saving
userSchema.pre('save', function(next) {
  if (this.isModified('stats.matchesPlayed') || this.isModified('stats.matchesWon')) {
    this.stats.winRate = this.stats.matchesPlayed > 0 
      ? (this.stats.matchesWon / this.stats.matchesPlayed) * 100 
      : 0;
  }
  if (this.isModified('stats.totalKills') || this.isModified('stats.totalDeaths')) {
    this.stats.kdr = this.stats.totalDeaths > 0 
      ? this.stats.totalKills / this.stats.totalDeaths 
      : this.stats.totalKills;
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
