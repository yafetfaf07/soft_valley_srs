import createHttpError from "http-errors";
import { RequestHandler } from "express";
import { JwtAuthService } from "../utils/jwt";
import { AdminService } from "../services/admin_service";
interface createTaskDTO {
  req_id: string;
  agent_id: string;
  admin_id: string;
}

interface filterRequestDTO {
  status: string;
  startDate: Date;
  endDate: Date;
}
export class AdminController {
  private _adminService: AdminService;
  private _jwtService: JwtAuthService;
  constructor(us: AdminService, jwt: JwtAuthService) {
    this._adminService = us;
    this._jwtService = jwt;
  }
  createTask: RequestHandler<unknown, unknown, createTaskDTO> = async (
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


    selectRequestByFilters: RequestHandler<filterRequestDTO, unknown, unknown> = async (
    req,
    res,
    next,
  ) => {
    const { status,startDate,endDate} = req.params;
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
        throw createHttpError(403, "Only an admin can filter tasks");
      }
    const filters = {
      status,startDate,endDate
    }

      const newServiceRequest = await this._adminService.selectRequestbyFilter(
        filters,
      );

      res.status(200).json({
        message: "Success",
        data: newServiceRequest
      });
    } catch (error) {
      console.error("Error in selectRequest controller:", error);
      next(error);
    }
  };

  paginatedRequest: RequestHandler<{page:number, limit:number}> =async(req,res,next) =>{
    try {
  const {page,limit} = req.params      
      

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) throw createHttpError(401, "Unauthorized");
      
      const token = authHeader.split(" ")[1];
      const decoded = this._jwtService.verifyAccessToken(token);

      if (decoded.role !== "admin") {
        throw createHttpError(403, "Access denied. Admins only.");
      }
      const result = await this._adminService.getAllRequestsPaginated(page,limit);

      res.status(200).json({
        message: "Requests retrieved successfully",
        ...result
      });

    } catch (error) {
      console.error("Admin Controller Error:", error);
      next(error);
    }
  };
}
