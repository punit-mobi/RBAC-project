import { z } from "zod";

// Validation schemas
export const createRoleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).min(1),
});
