import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const idParamsSchema = z.object({
  id: z
    .string()
    .min(1, "User ID is required")
    .regex(objectIdRegex, "Invalid user id format"),
});
