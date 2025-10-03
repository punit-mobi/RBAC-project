import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getAllPosts,
  createPost,
  deletePost,
  getPostById,
} from "./post.controller.js";
import {
  dataOperationsLimiter,
  strictLimiter,
} from "../../middleware/rateLimiting.middleware.js";

const router = express.Router();

// Get all posts endpoint with data operations rate limiting
router.get(
  "/",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("posts.view"),
  getAllPosts
);

// Create post endpoint with data operations rate limiting
router.post(
  "/",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("posts.create"),
  createPost
);

// Get post by ID endpoint with data operations rate limiting
router.get(
  "/:id",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("posts.view"),
  getPostById
);

// Delete post endpoint with strict rate limiting
router.delete(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("posts.delete"),
  deletePost
);

export { router as postRouter };
