import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from "./auth.controller.js";
import upload from "../../lib/multer.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { registerSchema } from "./schemas/register.schema.js";
import { loginSchema } from "./schemas/login.schema.js";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "./schemas/password-reset.schema.js";

const router = express.Router();

// Register endpoint
router.post(
  "/register",
  upload.single("profile_photo"),
  validateBody(registerSchema),
  registerUser
);

// Login endpoint
router.post("/login", validateBody(loginSchema), loginUser);

// Request password reset endpoint
router.post(
  "/request-password-reset",
  validateBody(requestPasswordResetSchema),
  requestPasswordReset
);

// Reset password endpoint
router.post(
  "/reset-password/:token",
  validateBody(resetPasswordSchema),
  resetPassword
);

export { router as authRouter };
