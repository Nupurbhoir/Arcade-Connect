import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    lobbyId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

chatMessageSchema.index({ lobbyId: 1, createdAt: -1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
