import { z } from "zod";

export const updateUserSchema = z.object({
  first_name: z
    .string("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .optional(),
  last_name: z
    .string()
    .max(50, "Last name must not exceed 50 characters")
    .optional(),
  about: z.string().max(500, "About must not exceed 500 characters").optional(),
  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional(),
  gender: z
    .enum(["male", "female", "other"], {
      message: "Gender must be either 'male', 'female', or 'other'",
    })
    .optional(),
  date_of_birth: z.string().optional(),
  education_qualification: z
    .string()
    .max(200, "Education qualification must not exceed 200 characters")
    .optional(),
});
