import express from "express";
import { UserController } from "../controllers/userControllers";

export class UserRouter { 
    private _userController: UserController;
    router;
    constructor(uc: UserController) {
        this._userController = uc;
        this.router = express.Router();
    }
    registerRoutes() {
        this.router.post("/register", this._userController.createUser);
        this.router.post('/login', this._userController.login)
        // this.router.get("/getUsername/:id", this._userController.findUserById);
        // this.router.get('/logout',this._userController.logout);
        return this.router;
    }
}