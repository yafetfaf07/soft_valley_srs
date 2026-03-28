import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
// import cors from "cors";
import path from "path";
import { isHttpError } from "http-errors";
import { UserRouter } from "./src/routes/user_router";
import { UserService } from "./src/services/user_service";
import { UserController } from "./src/controllers/user_controllers";
import { JwtAuthService } from "./utils/jwt";
import { AdminService } from "./src/services/admin_service";
import { AdminController } from "./src/controllers/admin_controller";
import { AdminRouter } from "./src/routes/admin_router";
dotenv.config();

const app = express();
// app.use(cors());
// app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


const jwtService = new JwtAuthService()

// User DI
const userService = new UserService();
const userController = new UserController(userService,jwtService);
const userRouter = new UserRouter(userController);

// Admin DI
const adminService = new AdminService();
const adminController = new AdminController(adminService,jwtService)
const adminRouter = new AdminRouter(adminController);


app.use("/api/admin",adminRouter.registerRoutes())
app.use("/api/users", userRouter.registerRoutes());

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occured";
  console.error(error);
  let stausCode = 500;
  if (isHttpError(error)) {
    stausCode = error.status;
    errorMessage = error.message;
  }
  res.status(stausCode).json({
    error: errorMessage,
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
