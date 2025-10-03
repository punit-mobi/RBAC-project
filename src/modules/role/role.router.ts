import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getAllPermissions,
} from "./role.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  dataOperationsLimiter,
  strictLimiter,
} from "../../middleware/rateLimiting.middleware.js";

const router = express.Router();

// Create role endpoint with strict rate limiting
router.post(
  "/",
  strictLimiter, // 10 requests per hour
  authMiddleware("roles.create"),
  createRole
);

// Get all roles endpoint with data operations rate limiting
router.get(
  "/",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("roles.view"),
  getAllRoles
);

// Get all permissions endpoint with data operations rate limiting
router.get(
  "/permissions",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("roles.view"),
  getAllPermissions
);

// Get role by ID endpoint with data operations rate limiting
router.get(
  "/:id",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("roles.view"),
  getRoleById
);

// Update role endpoint with strict rate limiting
router.put(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("roles.update"),
  updateRole
);

// Delete role endpoint with strict rate limiting
router.delete(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("roles.delete"),
  deleteRole
);

export { router as roleRouter };
