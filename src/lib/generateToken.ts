import jwt from "jsonwebtoken";

// generate token function used in register & login (auth)
export const generateToken = (userId: any, isAdmin: boolean): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

  const payload = {
    // to set user data in token
    userId,
    isAdmin,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  } as any);

  return token;
};
