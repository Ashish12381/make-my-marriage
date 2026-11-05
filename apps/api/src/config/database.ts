import mongoose from 'mongoose';

// Fail database operations promptly if a future route is mounted without a connection.
mongoose.set('bufferCommands', false);

let connection: Promise<typeof mongoose> | undefined;
export async function connectDatabase(uri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  connection ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10 })
    .catch((error: unknown) => {
      connection = undefined;
      throw error;
    });
  await connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  connection = undefined;
}
