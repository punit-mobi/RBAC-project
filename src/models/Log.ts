import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      enum: ["error", "warn", "info", "debug"],
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
