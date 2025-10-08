import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../common/response.js";
import { ErrorMessages } from "../common/messages.js";

/**
 * @param schema - Zod schema to validate against
 * @returns Middleware function
 */
export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
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

// ALL IN ONE VALIDATION TO HANDLE BODY, PARAMS, AND QUERY
export const validate = (schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: any[] = [];

      if (schema.body) {
        const processedBody = { ...req.body };
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

        // convert string boolean values to actual booleans
        if (processedBody.is_admin !== undefined) {
          if (typeof processedBody.is_admin === "string") {
            processedBody.is_admin =
              processedBody.is_admin === "true" ||
              processedBody.is_admin === "1";
          }
        }

        // parse address if it's a string (JSON)
        if (
          processedBody.address &&
          typeof processedBody.address === "string"
        ) {
          try {
            processedBody.address = JSON.parse(processedBody.address);
          } catch (error) {
            // if parsing fails, keep as string
          }
        }

        const bodyValidation = schema.body.safeParse(processedBody);
        if (!bodyValidation.success) {
          errors.push(
            ...bodyValidation.error.issues.map((issue) => ({
              field: `body.${issue.path.join(".")}`,
              message: issue.message,
              code: issue.code,
              received: issue.input,
            }))
          );
        } else {
          // req.body can be modified, so we can directly assign validated data
          req.body = bodyValidation.data;
        }
      }

      // validation for params
      if (schema.params) {
        const processedParams = { ...req.params };

        Object.keys(processedParams).forEach((key) => {
          if (processedParams[key] === "") {
            delete processedParams[key];
          }
        });

        const paramsValidation = schema.params.safeParse(processedParams);

        if (!paramsValidation.success) {
          errors.push(
            ...paramsValidation.error.issues.map((issue) => ({
              field: `params.${issue.path.join(".")}`,
              message: issue.message,
              code: issue.code,
              received: issue.input,
            }))
          );
        } else {
          // Store validated data in a custom property instead of modifying req.params
          (req as any).validatedParams = paramsValidation.data;
        }
      }

      // query validation
      if (schema.query) {
        const processedQuery = { ...req.query };

        //convert empty string to undefined
        Object.keys(processedQuery).forEach((key) => {
          if (processedQuery[key] === "") {
            delete processedQuery[key];
          }
        });

        // If no query parameters provided, use default values
        if (Object.keys(processedQuery).length === 0) {
          processedQuery.page = "1";
          processedQuery.limit = "10";
        }

        const queryValidation = schema.query.safeParse(processedQuery);
        if (!queryValidation.success) {
          errors.push(
            ...queryValidation.error.issues.map((issue) => ({
              field: `query.${issue.path.join(".")}`,
              message: issue.message,
              code: issue.code,
              received: issue.input,
            }))
          );
        } else {
          // Store validated data in a custom property instead of modifying req.query
          (req as any).validatedQuery = queryValidation.data;
        }
      }
      // if there are any validaiton errors reuturun them
      if (errors.length > 0) {
        return await handleResponse({
          res,
          message: ErrorMessages.VALIDATION_FAILED,
          status: StatusCodes.BAD_REQUEST,
          error: {
            errors,
            totalErrors: errors.length,
            details: "Please check the field errors below",
          },
          req,
        });
      }
      // continue if there is no error found
      next();
    } catch (error) {
      console.log("error in validaiotn middleware at the catch: ---->", error);
      return await handleResponse({
        res,
        message: ErrorMessages.VALIDATION_FAILED,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error,
        req,
      });
    }
  };
};
