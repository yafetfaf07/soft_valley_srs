import createHttpError from "http-errors";
import { RequestHandler } from "express";
import { JwtAuthService } from "../../utils/jwt";
import { AdminService } from "../services/admin_service";
interface createTask {
  req_id: string;
  agent_id: string;
  admin_id: string;
}
export class AdminController {
  private _adminService: AdminService;
  private _jwtService: JwtAuthService;
  constructor(us: AdminService, jwt: JwtAuthService) {
    this._adminService = us;
    this._jwtService = jwt;
  }
  createTask: RequestHandler<unknown, unknown, createTask> = async (
    req,
    res,
    next,
  ) => {
    const { req_id, agent_id, admin_id } = req.body;
    const authHeader = req.headers.authorization;

    try {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createHttpError(401, "Authorization header missing or invalid");
      }

      const token = authHeader.split(" ")[1];

      const decodedUser = this._jwtService.verifyAccessToken(token);

      if (!decodedUser || !decodedUser.id || !decodedUser.role) {
        throw createHttpError(401, "Invalid or expired token");
      }

      const authorizedRoles = "admin";
      if (!authorizedRoles.includes(decodedUser.role)) {
        throw createHttpError(403, "Only an admin can create a task");
      }
      if (!req_id || !agent_id || !admin_id ) {
        throw createHttpError(400, "Fields are required");
      }

      const newServiceRequest = await this._adminService.createTask(
        req_id,
        agent_id,
        decodedUser.id,
      );

      res.status(201).json({
        message: "Success",
        data: newServiceRequest
      });
    } catch (error) {
      console.error("Error in createRequest controller:", error);
      next(error);
    }
  };
}
