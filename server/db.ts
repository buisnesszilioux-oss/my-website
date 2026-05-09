import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mi-engineering";

let connected = false;

export async function connectDB() {
  if (connected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    connected = true;
    console.log("[db] Connected to MongoDB:", MONGODB_URI);
  } catch (err: any) {
    console.error("[db] MongoDB connection failed:", err.message);
    throw err;
  }
}

export default mongoose;
