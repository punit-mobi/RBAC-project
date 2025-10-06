import { z } from "zod";

export const registerSchema = z.object({
  first_name: z
    .string("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  last_name: z
    .string()
    .max(50, "Last name must not exceed 50 characters")
    .optional(),

  email: z.string("Email is required").email("Invalid email address"),

  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),

  about: z
    .string()
    .max(1000, "About must not exceed 1000 characters")
    .optional(),

  address: z
    .string()
    .max(200, "Address must not exceed 200 characters")
    .optional(),

  is_admin: z
    .union([z.boolean(), z.string(), z.undefined()])
    .optional()
    .default(false)
    .transform((val) => {
      if (val === undefined || val === null || val === "") {
        return false;
      }
      if (typeof val === "string") {
        return val === "true" || val === "1";
      }
      return Boolean(val);
    }),

  gender: z.enum(["male", "female", "other"], {
    message: "Gender must be either 'male', 'female', or 'other'",
  }),

  date_of_birth: z.string().optional(),

  education_qualification: z
    .string()
    .max(200, "Education qualification must not exceed 200 characters")
    .optional(),
});
