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
import { createRoleSchema } from "./schemas/create.role.schema.js";
import { validate } from "../../middleware/validation.middleware.js";
import { idParamsSchema } from "../user/schema/params.schema.js";
import { updateRoleSchema } from "./schemas/update.role.schema.js";

const router = express.Router();

// Create role
router.post(
  "/",
  strictLimiter, // 10 requests per hour
  authMiddleware("roles.create"),
  validate({ body: createRoleSchema }),
  createRole
);

// Get all roles (validation not required)
router.get(
  "/",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("roles.view"),
  getAllRoles
);

// Get all permissions
router.get(
  "/permissions",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("roles.view"),
  getAllPermissions
);

// Get role by ID
router.get(
  "/:id",
  dataOperationsLimiter, // 100 requests per 15 minutes
  authMiddleware("roles.view"),
  validate({ params: idParamsSchema }),
  getRoleById
);

// Update role
router.put(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("roles.update"),
  validate({ body: updateRoleSchema, params: idParamsSchema }),
  updateRole
);

// Delete role
router.delete(
  "/:id",
  strictLimiter, // 10 requests per hour
  authMiddleware("roles.delete"),
  validate({ params: idParamsSchema }),
  deleteRole
);

export { router as roleRouter };
