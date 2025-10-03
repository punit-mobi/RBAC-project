import { z } from "zod";

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  last_name: z
    .string()
    .max(50, "Last name must not exceed 50 characters")
    .optional(),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  // .regex(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  //   "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  // ),

  about: z
    .string()
    .max(1000, "About must not exceed 1000 characters")
    .optional(),

  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional(),

  is_admin: z.boolean().optional().default(false),

  gender: z.enum(["male", "female", "other"], {
    message: "Gender must be either 'male', 'female', or 'other'",
  }),

  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),

  education_qualification: z
    .string()
    .max(200, "Education qualification must not exceed 200 characters")
    .optional(),
});
