import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to start the API");
  }
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000);
  if (!Number.isInteger(serverSelectionTimeoutMS) || serverSelectionTimeoutMS < 500) {
    throw new Error("MONGO_SERVER_SELECTION_TIMEOUT_MS must be at least 500 milliseconds");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    throw error;
  }
};

export default connectDB;