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

const router = express.Router();

// Get all users endpoint
router.get("/", authMiddleware("users.view"), getAllUsers);

// Get user by ID endpoint
router.get("/:id", authMiddleware("users.view"), getUserById);

// Get current user profile endpoint
router.get("/profile/me", authMiddleware("users.view"), getUser);

// Update user endpoint
router.patch(
  "/:id",
  authMiddleware("users.update"),
  upload.single("profile_photo"),
  updateUser
);

// Delete user endpoint
router.delete("/:id", authMiddleware("users.delete"), deleteUser);

// Assign role to user endpoint
router.patch(
  "/:id/assign-role",
  authMiddleware("users.update"),
  assignRoleToUser
);

// Remove role from user endpoint
router.patch(
  "/:id/remove-role",
  authMiddleware("users.update"),
  removeRoleFromUser
);

export { router as userRouter };
