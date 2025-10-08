import { JwtPayload } from "jsonwebtoken";
import type { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId?: ObjectId;
      isAdmin?: boolean;
      userPermissions?: string[];
    }
  }
}
