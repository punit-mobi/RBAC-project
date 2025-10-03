// create post validation schemas
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000).optional(),
});
