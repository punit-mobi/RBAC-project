import { z } from "zod";

export const updateUserSchema = z.object({
  first_name: z.string().min(3).max(20).optional(),
  last_name: z.string().max(20).optional(),
  about: z.string().max(500).optional(),
  address: z
    .object({
      street_name: z.string().max(100).optional(),
      pincode: z.number().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  gender: z.enum(["male", "female"]).optional(),
  date_of_birth: z.string().optional(),
  education_qualification: z.string().optional(),
  role: z.string().optional(),
});
