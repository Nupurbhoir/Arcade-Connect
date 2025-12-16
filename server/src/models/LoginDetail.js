import mongoose from 'mongoose';

const loginDetailSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    loggedInAt: { type: Date, default: () => new Date(), index: true },
  },
  {
    collection: 'login details',
    timestamps: { createdAt: true, updatedAt: false },
  }
);

loginDetailSchema.index({ username: 1, loggedInAt: -1 });

const LoginDetail = mongoose.models.LoginDetail || mongoose.model('LoginDetail', loginDetailSchema);
export default LoginDetail;
