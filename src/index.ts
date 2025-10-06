import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import { connectToDB } from "./lib/ConnectDB.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { roleRouter } from "./modules/role/role.router.js";
import { userRouter } from "./modules/user/user.router.js";

import { postRouter } from "./modules/post/post.router.js";
import { setupSwagger } from "./lib/swagger.js";
import { StatusCodes } from "http-status-codes";
import { seedRBAC } from "./lib/rbacSeed.js";
import { generalApiLimiter } from "./middleware/rateLimiting.middleware.js";

dotenv.config();

const app = express();

// middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply general rate limiting to all API routes
app.use("/api", generalApiLimiter);

setupSwagger(app);

// testing api, health check
app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    status: "success",
    status_code: StatusCodes.OK,
    message: "All okay",
    userId: req.userId,
    isAdmin: req.isAdmin,
  });
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/roles", roleRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
//todo app.use("/api/v1/master-data", authMiddleware, masterDataRouter);

// todo error middleware
// app.use(errorMiddleware);

// connect to db & server
const port = process.env.PORT || 4040;
connectToDB()
  .then(async () => {
    // Seed RBAC data after database connection
    await seedRBAC();

    app.listen(port, () => {
      console.log("server created at port: ", port);
    });
  })
  .catch((error) => {
    console.log("error occured while creating the server: ", error); //! todo  remove
  });
