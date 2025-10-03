import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getAllPosts,
  createPost,
  deletePost,
  getPostById,
} from "./post.controller.js";

const router = express.Router();

// Get all posts endpoint
router.get("/", authMiddleware("posts.view"), getAllPosts);

// Create post endpoint
router.post("/", authMiddleware("posts.create"), createPost);

// Get post by ID endpoint
router.get("/:id", authMiddleware("posts.view"), getPostById);

// Delete post endpoint
router.delete("/:id", authMiddleware("posts.delete"), deletePost);

export { router as postRouter };
