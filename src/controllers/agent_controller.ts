import createHttpError from "http-errors";
import { RequestHandler } from "express";
import { JwtAuthService } from "../../utils/jwt";
import { AgentService } from "../services/agent_service";

export class AgentController {
  private _agentService: AgentService;
  private _jwtService: JwtAuthService;
  constructor(as: AgentService, jwt: JwtAuthService) {
    this._agentService = as;
    this._jwtService = jwt;
  }
  viewTaskByAgentId: RequestHandler<unknown, unknown, unknown> = async (
    req,
    res,
    next,
  ) => {
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

      const authorizedRoles = ["agent"];
      if (!authorizedRoles.includes(decodedUser.role)) {
        throw createHttpError(403, "Only an agent can access this");
      }

      const newServiceRequest = await this._agentService.createTask(
        decodedUser.id,
      );

      res.status(200).json({
        message: "Success",
        data: newServiceRequest,
      });
    } catch (error) {
      console.error("Error in viewtask  agent-controller:", error);
      next(error);
    }
  };

  updateServiceRequestStatus: RequestHandler<
    { req_id: string },
    unknown,
    { new_status: string }
  > = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const { new_status } = req.body;
    const { req_id } = req.params;
    const file = `uploads/${req.file?.filename}`;

    try {
      // 1. Authorization & Role Checks (Existing Logic)
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw createHttpError(401, "Authorization header missing or invalid");
      }

      const token = authHeader.split(" ")[1];
      const decodedUser = this._jwtService.verifyAccessToken(token);

      if (!decodedUser || !decodedUser.id || !decodedUser.role) {
        throw createHttpError(401, "Invalid or expired token");
      }

      if (decodedUser.role !== "agent") {
        throw createHttpError(403, "Only an agent can access this");
      }

      const updatedData = await this._agentService.updateStatusTask(
        decodedUser.id,
        req_id,
        new_status,
        file 
      );

      const io = req.app.get("io");


      const citizenId = updatedData.updatedRequest?.citizen_id;
      if (citizenId) {
        io.emit("notification", {
          message: `Global Update: Request ${req_id} is now ${new_status}`,
        });
      }

      res.status(200).json({
        message: "Task and status updated successfully",
        data: updatedData,
      });
    } catch (error) {
      console.error("Error in updateServiceRequestStatus:", error);
      next(error);
    }
  };
}
