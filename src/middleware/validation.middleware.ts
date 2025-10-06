import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../common/response.js";

/**
 * @param schema - Zod schema to validate against
 * @returns Middleware function
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Handle multipart form data - convert string values to appropriate types
      const processedBody = { ...req.body };

      // Convert empty strings to undefined for optional fields
      Object.keys(processedBody).forEach((key) => {
        if (
          processedBody[key] === "" &&
          key !== "first_name" &&
          key !== "email" &&
          key !== "password" &&
          key !== "gender"
        ) {
          processedBody[key] = undefined;
        }
      });

      // Convert string boolean values to actual booleans
      if (processedBody.is_admin !== undefined) {
        if (typeof processedBody.is_admin === "string") {
          processedBody.is_admin =
            processedBody.is_admin === "true" || processedBody.is_admin === "1";
        }
      }

      // Parse address if it's a string (JSON)
      if (processedBody.address && typeof processedBody.address === "string") {
        try {
          processedBody.address = JSON.parse(processedBody.address);
        } catch (error) {
          // If parsing fails, keep as string
        }
      }

      const validatedData = schema.safeParse(processedBody);

      if (!validatedData.success) {
        const errorMessages = validatedData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
          received: issue.input,
        }));

        return await handleResponse({
          res,
          message: "Validation failed",
          status: StatusCodes.BAD_REQUEST,
          error: {
            errors: errorMessages,
            totalErrors: errorMessages.length,
            details: "Please check the field errors below",
          },
          req,
        });
      }

      // replace req.body with validated data
      req.body = validatedData.data;

      // continue
      next();
    } catch (error) {
      // Handle other errors
      return await handleResponse({
        res,
        message: "Validation error",
        status: StatusCodes.BAD_REQUEST,
        error: error,
        req,
      });
    }
  };
};
