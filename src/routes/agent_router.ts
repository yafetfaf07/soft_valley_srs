import express from "express";
import { AgentController } from "../controllers/agent_controller";
import { upload } from "../middleware/multerconfig";

export class AgentRouter { 
    private _agentController: AgentController;
    router;

    constructor(uc: AgentController) {
        this._agentController = uc;
        this.router = express.Router();
    }

    registerRoutes() {
        this.router.get("/getTaskById", this._agentController.viewTaskByAgentId);
        this.router.patch("/requests/:req_id/status", upload.single('file'),this._agentController.updateServiceRequestStatus);
        return this.router;
    }
}