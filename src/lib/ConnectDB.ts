import mongoose from "mongoose";
import logErrorToDB from "./LogError";
import { ErrorMessages } from "../common/messages";

// connect to database
export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log("DATABASE CONNECTED!");
  } catch (error) {
    // logErrorToDB(req, error, ErrorMessages.DATABASE_CONNECTION_FAILED);
    console.error("Problem while connecting to the database! ", error);
    throw error;
  }
};
