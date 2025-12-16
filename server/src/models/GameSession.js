import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    game: { type: String, required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    duration: { type: Number }, // in seconds
    status: { type: String, enum: ['active', 'completed', 'aborted'], default: 'active' },
    score: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    achievements: [{ type: String }],
    metadata: {
      difficulty: { type: String, default: 'normal' },
      mode: { type: String, default: 'single' },
      platform: { type: String, default: 'web' },
      device: { type: String },
    },
    events: [{
      type: { type: String, required: true },
      timestamp: { type: Date, required: true },
      data: { type: mongoose.Schema.Types.Mixed },
    }],
  },
  { timestamps: true }
);

// Calculate duration when session ends
gameSessionSchema.pre('save', function(next) {
  if (this.isModified('endedAt') && this.endedAt && this.startedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  next();
});

const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
