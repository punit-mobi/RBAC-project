import { Request, Response, NextFunction } from "express";
import { handleResponse } from "../common/response.js";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../common/messages.js";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Log the error for debugging
    console.error("Error caught by middleware:", err);

    // Send standardized error response
    handleResponse({
      res,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: {
        message: err.message || "An unexpected error occurred",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
      req,
    });
  } catch (error) {
    // Fallback if handleResponse itself fails
    console.error("💥 Critical error in error middleware:", error);
    res.status(500).json({
      status: false,
      status_code: 500,
      message: "Critical server error",
      error: "Unable to process error response",
    });
  }
};
