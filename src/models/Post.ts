import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title must be less than 200 characters"],
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [5000, "Content must be less than 5000 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Indexes for better query performance
postSchema.index({ title: "text", content: "text" });
postSchema.index({ author: 1 });

export const Post = mongoose.model("Post", postSchema);
