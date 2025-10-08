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
import {
  dataOperationsLimiter,
  strictLimiter,
} from "../../middleware/rateLimiting.middleware.js";
import { updateUserSchema } from "./schema/update.schema.js";
import { validate } from "../../middleware/validation.middleware.js";
import { idParamsSchema } from "./schema/params.schema.js";
import { userListQuerySchema } from "./schema/query.schema.js";

const router = express.Router();

// Get all users endpoint with query validation
router.get(
  "/",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("users.view"),
  validate({ query: userListQuerySchema }),
  getAllUsers
);

// Get user by ID endpoint with data operations rate limiting
router.get(
  "/:id",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("users.view"),
  validate({ params: idParamsSchema }),
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
  validate({ body: updateUserSchema, params: idParamsSchema }),
  updateUser
);

// Delete user endpoint with strict rate limiting
router.delete(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("users.delete"),
  validate({ params: idParamsSchema }),
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
