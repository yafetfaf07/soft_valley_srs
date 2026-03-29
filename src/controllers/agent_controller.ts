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
  viewTaskByAgentId: RequestHandler<unknown,unknown,  unknown> = async (
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
     

      const newServiceRequest = await this._agentService.createTask(decodedUser.id)

      res.status(200).json({
        message: "Success",
        data: newServiceRequest
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

    // 2. Database Update
    const updatedData = await this._agentService.updateStatusTask(
      decodedUser.id,
      req_id,
      new_status,
      file || ""
    );

    // 3. WebSocket Real-Time Notification
    const io = req.app.get("io");

    // Option A: Broadcast to everyone (Simple)
    // io.emit("request_updated", { req_id, new_status });

    // Option B: Target the specific Citizen (Better)
    // Assuming updatedData contains the serviceRequest record with citizen_id
    const citizenId = updatedData.updatedRequest?.citizen_id;
    if (citizenId) {
      io.to(citizenId).emit("notification", {
        message: `Your request status has been updated to: ${new_status}`,
        req_id: req_id,
        imageUrl: file
      });
    }

    // 4. Send Response
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
