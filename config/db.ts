import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async () => {
  console.log("connectDB strted");
  try {
    const uri: any = process.env.MONGO_URI;

    const options: any = {};
    await mongoose.connect(uri, options);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
