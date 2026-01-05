import mongoose from "mongoose";
import { config } from "../config/index";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed");
    process.exit(1);
  }
};
