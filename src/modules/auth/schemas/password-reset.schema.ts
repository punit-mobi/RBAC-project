import { z } from "zod";

// Schema for requesting password reset
export const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Schema for resetting password with token
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  // ),
});
