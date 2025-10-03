import express from "express";
import {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  assignRoleToUser,
  removeRoleFromUser,
} from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import upload from "../../lib/multer.js";
import {
  dataOperationsLimiter,
  strictLimiter,
} from "../../middleware/rateLimiting.middleware.js";

const router = express.Router();

// Get all users endpoint with data operations rate limiting
router.get(
  "/",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("users.view"),
  getAllUsers
);

// Get user by ID endpoint with data operations rate limiting
router.get(
  "/:id",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("users.view"),
  getUserById
);

// Get current user profile endpoint with data operations rate limiting
router.get(
  "/profile/me",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("users.view"),
  getUser
);

// Update user endpoint with data operations rate limiting
router.patch(
  "/:id",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("users.update"),
  upload.single("profile_photo"),
  updateUser
);

// Delete user endpoint with strict rate limiting
router.delete(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("users.delete"),
  deleteUser
);

// Assign role to user endpoint with strict rate limiting
router.patch(
  "/:id/assign-role",
  strictLimiter, // 10 requests per hour
  authMiddleware("users.update"),
  assignRoleToUser
);

// Remove role from user endpoint with strict rate limiting
router.patch(
  "/:id/remove-role",
  strictLimiter, // 10 requests per hour
  authMiddleware("users.update"),
  removeRoleFromUser
);

export { router as userRouter };
