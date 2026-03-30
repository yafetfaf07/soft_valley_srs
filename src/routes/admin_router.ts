import express from "express";
import { AdminController } from "../controllers/admin_controller";

export class AdminRouter { 
    private _adminController: AdminController;
    router;

    constructor(uc: AdminController) {
        this._adminController = uc;
        this.router = express.Router();
    }

    registerRoutes() {
        this.router.post("/create-task", this._adminController.createTask);
        this.router.get("/filter/:status/:startDate/:endDate", this._adminController.selectRequestByFilters)
        return this.router;
    }
}