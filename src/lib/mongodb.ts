/**
 * src/lib/mongodb.ts
 * MongoDB Atlas connection singleton for Next.js App Router.
 *
 * MONGODB_URI is read lazily (at connect time, not module load time)
 * so missing env vars don't crash the build or cold start on Vercel.
 */

import mongoose, { type ConnectOptions } from "mongoose";

const CONNECTION_OPTIONS: ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};
if (!global._mongooseCache) global._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const readyState = mongoose.connection.readyState;

  // 1: connected
  if (readyState === 1) {
    return mongoose;
  }

  // 2: connecting
  if (readyState === 2 && cached.promise) {
    return cached.promise;
  }

  // If disconnected (0) or disconnecting (3), clean up cached connection references to force a reconnect
  if (readyState === 0 || readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  // Read URI lazily — throws a clear error if missing at runtime
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set.");

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, CONNECTION_OPTIONS)
      .then((m) => {
        console.log("✅  MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌  MongoDB disconnected");
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
