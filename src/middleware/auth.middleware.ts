import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import { ErrorMessages } from "../common/messages.js";
import { StatusCodes } from "http-status-codes";
import { handleResponse } from "../common/response.js";
import User from "../models/User.js";

interface CustomJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
  isAdmin: boolean;
}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
      isAdmin?: boolean;
      userPermissions?: string[];
    }
  }
}

/**
 * Middleware to authenticate users and check for required permissions.
 * @param requiredPermission - The name of the permission required to access the route.
 */
export const authMiddleware = (requiredPermission?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return await handleResponse({
          res,
          message: ErrorMessages.TOKEN_NOT_FOUND,
          status: StatusCodes.UNAUTHORIZED,
          error: null,
          req,
        });
      }

      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (typeof jwtSecret !== "string") {
        throw new Error("JWT_SECRET is not defined");
      }

      if (!token) {
        return await handleResponse({
          res,
          message: ErrorMessages.TOKEN_NOT_FOUND,
          status: StatusCodes.UNAUTHORIZED,
          error: null,
          req,
        });
      }

      const decoded = jwt.verify(
        token,
        jwtSecret as string
      ) as unknown as CustomJwtPayload;

      // Fetch user and populate their role
      const user = await User.findById(decoded.userId).populate("role");

      if (!user || !user.is_active) {
        return await handleResponse({
          res,
          message: ErrorMessages.AUTHENTICATION_FAILED,
          status: StatusCodes.UNAUTHORIZED,
          error: null,
          req,
        });
      }

      // Attach user info to the request
      req.userId = user._id as Types.ObjectId;
      req.isAdmin = user.is_admin;

      // If a permission is required, check if the user has it
      if (requiredPermission) {
        // Get permissions directly from role (now stored as array of strings)
        const userPermissions = (user.role as any)?.permissions || [];

        const hasPermission = userPermissions.includes(requiredPermission);
        if (hasPermission) {
          req.userPermissions = userPermissions;
          next();
        } else {
          return await handleResponse({
            res,
            message: ErrorMessages.INSUFFICIENT_PERMISSIONS,
            status: StatusCodes.FORBIDDEN,
            error: { requiredPermission, userPermissions },
            req,
          });
        }
      } else next();
    } catch (error) {
      await handleResponse({
        res,
        message: ErrorMessages.AUTHENTICATION_FAILED,
        status: StatusCodes.UNAUTHORIZED,
        error: error,
        req,
      });
    }
  };
};
