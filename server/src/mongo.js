import mongoose from 'mongoose';

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const m = String(uri).match(/@([^/]+)\/?([^?]*)/);
    const host = m?.[1] || 'unknown-host';
    const db = m?.[2] ? `/${m[2]}` : '';
    console.log(`MongoDB connecting to ${host}${db}`);
  } catch {
    // ignore
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      dbName: 'ArcadeConnect',
    });
    const dbName = mongoose.connection?.db?.databaseName;
    console.log(`MongoDB connected${dbName ? ` (${dbName})` : ''}`);
  } catch (err) {
    console.error('MongoDB connection failed. Running without Mongo persistence.');
    console.error(err?.message || err);
  }
}
