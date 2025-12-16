import mongoose from 'mongoose';

const lobbyTimeSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    enteredAt: { type: Date, default: () => new Date(), index: true },
  },
  {
    collection: 'lobby time',
    timestamps: { createdAt: true, updatedAt: true },
  }
);

lobbyTimeSchema.index({ username: 1, enteredAt: -1 });

const LobbyTime = mongoose.models.LobbyTime || mongoose.model('LobbyTime', lobbyTimeSchema);
export default LobbyTime;
