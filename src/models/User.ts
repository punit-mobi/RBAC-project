import mongoose from "mongoose";

// user schema
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    last_name: {
      type: String,
      default: "",
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 40,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 60,
    },
    about: {
      type: String,
      maxLength: 500,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    is_admin: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: false,
      index: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    date_of_birth: {
      type: Date,
      default: null,
    },
    education_qualification: {
      type: String,
      default: "",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.index({ is_admin: 1, is_active: 1 });

const User = mongoose.model("User", userSchema);
export default User;
