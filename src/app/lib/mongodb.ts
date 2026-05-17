/**
 * src/app/lib/mongodb.ts
 *
 * Convenience re-export so API routes can use either:
 *   import { connectDB } from '@/app/lib/mongodb'   ← from inside src/app/
 *   import { connectDB } from '@/lib/mongodb'        ← from anywhere
 *
 * The actual implementation lives in src/lib/mongodb.ts.
 */
export { connectDB, disconnectDB, isConnected } from "@/lib/mongodb";
