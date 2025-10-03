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
import {
  authLimiter,
  passwordResetLimiter,
} from "../../middleware/rateLimiting.middleware.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  upload.single("profile_photo"),
  validateBody(registerSchema),
  registerUser
);

router.post("/login", authLimiter, validateBody(loginSchema), loginUser);

router.post(
  "/request-password-reset",
  passwordResetLimiter,
  validateBody(requestPasswordResetSchema),
  requestPasswordReset
);

router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  validateBody(resetPasswordSchema),
  resetPassword
);

export { router as authRouter };
