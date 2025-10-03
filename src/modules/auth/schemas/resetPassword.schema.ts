import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(3, { message: "Password is too short" })
    .max(60, { message: "Password cannot exceed 60 characters" }),
});
