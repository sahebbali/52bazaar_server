import mongoose from "mongoose";

let isConnected;

const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Mongo connection timed out")), ms)
  );

export const connA = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) return mongoose;

  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    const db = await Promise.race([
      mongoose.connect(process.env.MONGO_URI, options),
      timeout(8000),
    ]);

    isConnected = db.connections[0].readyState;
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
