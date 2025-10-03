import User from "../models/User.js";
import MasterData from "../models/MasterData.js";
import { connectToDB } from "./ConnectDB.js";
import bcrypt from "bcrypt";
import { users } from "./data.js";
import { masterDataSeed } from "./masterDataSeed.js";
import { ErrorMessages } from "../common/messages.js";
import mongoose from "mongoose";
import env from "dotenv";
env.config();

// function to seed the database
const seedDatabase = async () => {
  try {
    await connectToDB();

    // Clear existing data
    await User.deleteMany({});
    console.log("all users deleted successfully from the db");

    await MasterData.deleteMany({});
    console.log("all master data deleted successfully from the db");

    // Seed users
    const salt = await bcrypt.genSalt(10);
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword,
          date_of_birth: new Date(user.date_of_birth),
          is_active: user.is_admin, // Admin users are active by default
        };
      })
    );
    console.log("user with hashed pass: ", usersWithHashedPasswords);
    await User.insertMany(usersWithHashedPasswords);
    console.log("users seeded successfully!");

    // Seed master data
    await MasterData.insertMany(masterDataSeed);
    console.log("master data seeded successfully!");

    console.log("seed successful!");
  } catch (error) {
    console.log(ErrorMessages.SEED_ERROR, error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
