import mongoose from "mongoose";

export default async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || "rtpl",
  });
  console.log("[rtpl] mongodb connected:", mongoose.connection.name);
}
