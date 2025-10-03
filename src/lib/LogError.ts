import type { Request } from "express";
import Log from "../models/Log.js";

/**
 * Asynchronously stores an error log in the database.
 * This utility captures details from the request and the error object
 * to create a comprehensive log entry.
 *
 * @param req - The Express request object.
 * @param error - The error object. Can be of any type.
 * @param message - A descriptive message for the error context.
 */
const logErrorToDB = async (
  req: Request,
  error: any,
  message: string
): Promise<void> => {
  try {
    const logEntry = new Log({
      level: "error",
      message: message,
      // Ensure stack is a string, even for non-Error objects.
      stack: error?.stack ?? "No stack available",
      meta: {
        timestamp: new Date(),
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        // userId might not always be present on the request object.
        userId: req.userId?.toString() ?? "",
      },
    });

    await logEntry.save();
    // console.log("error successfully logged to the database.");
  } catch (dbError) {
    console.error("CRITICAL: Failed to log error to database:", dbError);
    console.error("Original Error Details:", {
      message,
      error,
      request: {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      },
    });
  }
};

export default logErrorToDB;
