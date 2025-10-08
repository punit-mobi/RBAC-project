import { z } from "zod";

export const userListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
});
