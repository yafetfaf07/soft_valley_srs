import express from "express";
import { UserController } from "../controllers/user_controllers";
import { AdminController } from "../controllers/admin_controller";
import { AgentController } from "../controllers/agent_controller";
// Assuming your Request Controller is either in UserController or a new RequestController

export class AgentRouter { 
    private _agentController: AgentController;
    router;

    constructor(uc: AgentController) {
        this._agentController = uc;
        this.router = express.Router();
    }

    registerRoutes() {
        this.router.get("/getTaskById", this._agentController.viewTaskByAgentId);
        return this.router;
    }
}