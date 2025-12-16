import mongoose from 'mongoose';

const lobbySchema = new mongoose.Schema(
  {
    game: { type: String, default: 'default' },
    players: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        team: { type: String, enum: ['A', 'B'], required: true },
        ready: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Lobby = mongoose.models.Lobby || mongoose.model('Lobby', lobbySchema);

export default Lobby;
