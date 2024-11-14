import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("MISSONG MONGODB_URL");

  if (isConnected) {
    return console.log("MonDb is already connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devflow",
    });

    isConnected = true;
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
