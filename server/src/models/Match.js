import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    lobbyId: { type: String, required: true },
    game: { type: String, default: 'default' },
    gameMode: { type: String, default: 'classic' },
    map: { type: String, default: 'default' },
    status: { type: String, enum: ['in-progress', 'completed', 'aborted'], default: 'in-progress' },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    duration: { type: Number }, // in seconds
    winningTeam: { type: String, enum: ['A', 'B', 'draw'] },
    players: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        team: { type: String, enum: ['A', 'B'], required: true },
        stats: {
          kills: { type: Number, default: 0 },
          deaths: { type: Number, default: 0 },
          assists: { type: Number, default: 0 },
          damage: { type: Number, default: 0 },
          score: { type: Number, default: 0 },
          mvp: { type: Boolean, default: false },
        },
        performance: {
          accuracy: { type: Number, default: 0 },
          headshots: { type: Number, default: 0 },
          multikills: { type: Number, default: 0 },
          survivalTime: { type: Number, default: 0 },
        },
      },
    ],
    events: [{
      type: { type: String, required: true }, // 'kill', 'death', 'assist', 'objective', etc.
      timestamp: { type: Date, required: true },
      playerId: { type: String, required: true },
      targetId: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed },
    }],
    score: {
      teamA: { type: Number, default: 0 },
      teamB: { type: Number, default: 0 },
    },
    server: {
      region: { type: String, default: 'Global' },
      latency: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Calculate duration when match ends
matchSchema.pre('save', function(next) {
  if (this.isModified('endedAt') && this.endedAt && this.startedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  next();
});

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

export default Match;
