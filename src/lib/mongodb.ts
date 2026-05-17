/**
 * src/lib/mongodb.ts
 *
 * Canonical MongoDB Atlas connection utility for Next.js App Router.
 *
 * Why this file exists alongside src/app/lib/db.ts:
 *   - This file follows the standard Next.js convention (src/lib/*)
 *   - It supports both MONGODB_URI (simple) and the full Atlas config
 *   - API routes and server components import from '@/lib/mongodb'
 *
 * Singleton pattern:
 *   Next.js hot-reloads modules in dev, which would create a new Mongoose
 *   connection on every file save. We cache the promise on the Node.js
 *   global object so it survives module re-evaluation.
 *
 * Usage:
 *   import { connectDB } from '@/lib/mongodb'
 *   await connectDB()
 */

import mongoose, { type ConnectOptions } from "mongoose";

// ── Environment ───────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌  MONGODB_URI is not defined.\n" +
      "Add it to .env.local:\n" +
      "  MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dwarik",
  );
}

// ── Connection options ────────────────────────────────────────────────────────

const CONNECTION_OPTIONS: ConnectOptions = {
  // Don't buffer commands when the connection is down — fail fast instead
  bufferCommands: false,
  // Atlas recommended settings
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// ── Global cache type ─────────────────────────────────────────────────────────

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

// ── Singleton cache ───────────────────────────────────────────────────────────

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Connect to MongoDB Atlas (or local MongoDB).
 * Returns the cached connection if one already exists.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, CONNECTION_OPTIONS)
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

/**
 * Disconnect from MongoDB.
 * Useful in scripts and tests — not needed in normal app usage.
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌  MongoDB disconnected");
  }
}

/**
 * Returns true if Mongoose is currently connected.
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
