import request from "supertest";
import express from "express";
import { UserController } from "../controllers/user_controllers";
import { UserService } from "../services/user_service";
import { JwtAuthService } from "../utils/jwt";

const app = express();
app.use(express.json());

const mockUserService = new UserService() as jest.Mocked<UserService>;
const jwtService = new JwtAuthService();
const userController = new UserController(mockUserService, jwtService);

app.post("/api/users/login", (req, res, next) => userController.login(req, res, next));

describe("User Controller - Login", () => {
  
  it("should return 200 and a token for valid credentials", async () => {
    const mockUser = [{ id: "123", name: "Tester", role: "citizen", password: "hashed_password" }];
    jest.spyOn(mockUserService, "getUserByEmail").mockResolvedValue(mockUser as any);
    


    const response = await request(app)
      .post("/api/users/login")
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.message).toBe("Login Successful");
  });

  it("should return 401 for invalid credentials", async () => {
    jest.spyOn(mockUserService, "getUserByEmail").mockResolvedValue([]);

    const response = await request(app)
      .post("/api/users/login")
      .send({
        email: "wrong@example.com",
        password: "wrong"
      });

    expect(response.status).toBe(401);
  });
});