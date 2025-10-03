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
      const validatedData = schema.parse(req.body);

      // replace req.body with validated data
      req.body = validatedData;

      // continue
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return await handleResponse({
          res,
          message: "Validation failed",
          status: StatusCodes.BAD_REQUEST,
          error: { errors: errorMessages },
          req,
        });
      }

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
