import mongoose from "mongoose";

// token schema for storing token during rest-password
const tokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 900, // means 15m
  },
});

const Token = mongoose.model("Token", tokenSchema);

export default Token;
