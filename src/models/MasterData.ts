import mongoose from "mongoose";

// Master data schema for storing reference data
const masterDataSchema = new mongoose.Schema(
  {
    data_type: {
      type: String,
      required: true,
      enum: ["roles", "permissions", "modules", "configurations"],
      index: true,
    },
    data_key: {
      type: String,
      required: true,
      index: true,
    },
    data_value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    last_synced: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound index for efficient queries
masterDataSchema.index({ data_type: 1, data_key: 1 }, { unique: true });
masterDataSchema.index({ is_active: 1, data_type: 1 });

const MasterData = mongoose.model("MasterData", masterDataSchema);
export default MasterData;
