import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import { Server } from "socket.io"; 
import { isHttpError } from "http-errors";
import { UserRouter } from "./src/routes/user_router";
import { UserService } from "./src/services/user_service";
import { UserController } from "./src/controllers/user_controllers";
import { JwtAuthService } from "./src/utils/jwt";
import { AdminService } from "./src/services/admin_service";
import { AdminController } from "./src/controllers/admin_controller";
import { AdminRouter } from "./src/routes/admin_router";
import { AgentService } from "./src/services/agent_service";
import { AgentController } from "./src/controllers/agent_controller";
import { AgentRouter } from "./src/routes/agent_router";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jwtService = new JwtAuthService();

// User DI
const userService = new UserService();
const userController = new UserController(userService, jwtService);
const userRouter = new UserRouter(userController);

// Admin DI
const adminService = new AdminService();
const adminController = new AdminController(adminService, jwtService);
const adminRouter = new AdminRouter(adminController);

// Agent DI
const agentService = new AgentService();
const agentController = new AgentController(agentService, jwtService);
const agentRouter = new AgentRouter(agentController);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/admin", adminRouter.registerRoutes());
app.use("/api/users", userRouter.registerRoutes());
app.use("/api/agents", agentRouter.registerRoutes());

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (userId: string) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occured";
  console.error(error);
  let stausCode = 500;
  if (isHttpError(error)) {
    stausCode = error.status;
    errorMessage = error.message;
  }
  res.status(stausCode).json({ error: errorMessage });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});