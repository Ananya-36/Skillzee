import mongoose from "mongoose";
import { env } from "./env.js";

let cachedConnection: typeof mongoose | null = null;

function maskMongoUri(uri: string) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

export async function connectDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error.message);
    });

    console.log(`MongoDB connected: ${maskMongoUri(env.MONGO_URI)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown MongoDB connection error";
    console.error(`Failed to connect to MongoDB Atlas: ${message}`);
    throw error;
  }

  return cachedConnection;
}
