import express from "express";
import { UserController } from "../controllers/user_controllers";
import { upload } from "../middleware/multerconfig";

export class UserRouter { 
    private _userController: UserController;
    router;

    constructor(uc: UserController) {
        this._userController = uc;
        this.router = express.Router();
    }

    registerRoutes() {
        // --- User Routes ---
        this.router.post("/register", this._userController.createUser);
        this.router.post('/login', this._userController.login);
        this.router.get("/getRequestById", this._userController.getRequestsByUserId);
        
        this.router.post("/create-request", upload.single('file'),this._userController.createRequest);


        return this.router;
    }
}