import { z } from "zod";

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});
