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

const router = express.Router();

// Create role endpoint
router.post("/", authMiddleware("roles.create"), createRole);

// Get all roles endpoint
router.get("/", authMiddleware("roles.view"), getAllRoles);

// Get all permissions endpoint
router.get("/permissions", authMiddleware("roles.view"), getAllPermissions);

// Get role by ID endpoint
router.get("/:id", authMiddleware("roles.view"), getRoleById);

// Update role endpoint
router.put("/:id", authMiddleware("roles.update"), updateRole);

// Delete role endpoint
router.delete("/:id", authMiddleware("roles.delete"), deleteRole);

export { router as roleRouter };
