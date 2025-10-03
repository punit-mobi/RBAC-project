import mongoose from "mongoose";

// connect to database
export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log("DATABASE CONNECTED!");
  } catch (error) {
    console.error("Problem while connecting to the database! ", error);
    throw error; // Re-throw to prevent app from continuing without DB
  }
};
