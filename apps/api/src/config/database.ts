import mongoose from 'mongoose';

// Fail database operations promptly if a future route is mounted without a connection.
mongoose.set('bufferCommands', false);

export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
