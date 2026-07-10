import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: typeof import("mongoose") | null; promise: Promise<typeof import("mongoose")> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export { connectDB };
