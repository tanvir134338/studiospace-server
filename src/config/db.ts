import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

export const client = new MongoClient(uri);

let isConnected = false;

export async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
      console.log("MongoDB connected successfully!");
    }

    return client.db("studiospace");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
