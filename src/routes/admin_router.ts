import express from "express";
import { UserController } from "../controllers/user_controllers";
import { AdminController } from "../controllers/admin_controller";
// Assuming your Request Controller is either in UserController or a new RequestController

export class AdminRouter { 
    private _adminController: AdminController;
    router;

    constructor(uc: AdminController) {
        this._adminController = uc;
        this.router = express.Router();
    }

    registerRoutes() {
        this.router.post("/create-task", this._adminController.createTask);
        return this.router;
    }
}