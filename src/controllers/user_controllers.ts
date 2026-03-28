import createHttpError from "http-errors";
import { RequestHandler } from "express";
import { UserService } from "../services/user_service";
import { JwtAuthService } from "../../utils/jwt";
import HashPasswordService from "../../utils/hash_password";
import { NewRequest } from "..";
interface serviceRequest {
  id: string;
  citizen_id: string;
  title: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
  createdAt: string;
}
export class UserController {
  private _userService: UserService;
  private _jwtService: JwtAuthService;
  constructor(us: UserService, jwt: JwtAuthService) {
    this._userService = us;
    this._jwtService = jwt;
  }
  createUser: RequestHandler<
    unknown,
    unknown,
    {
      name: string;
      password: string;
      email: string;
      role: "citizen" | "admin" | "agent" | "manager" | null | undefined;
    }
  > = async (req, res, next) => {
    const { name, password, email, role } = req.body;
    try {
      if (
        name == undefined ||
        password == undefined ||
        email == undefined ||
        !role
      ) {
        throw createHttpError(400, "All fields are required");
      }
      const existingUser = await this._userService.getUserByEmail(email);
      if (existingUser.length > 0) {
        console.log(existingUser);
        throw createHttpError(409, "User already exists");
      }
      const newUser = await this._userService.createUser(
        name,
        password,
        email,
        role,
      );

      const accessToken = this._jwtService.generateAccessToken({
        id: newUser[0].id,
        name: newUser[0].name,
        role: newUser[0].role,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        id: newUser[0].id,
        name: newUser[0].name,
        role: newUser[0].role,
      });

      res.cookie("token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        token: accessToken,
        message: "Registration Successful",
        data: newUser,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
createRequest: RequestHandler<
  unknown,
  unknown,
  NewRequest
> = async (req, res, next) => {
  const { title, description, imageUrl, latitude, longitude, category } = req.body;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createHttpError(401, "Authorization header missing or invalid");
    }
    const token = authHeader.split(" ")[1];

    const decodedUser = this._jwtService.verifyAccessToken(token);
    if (!decodedUser || !decodedUser.id) {
      throw createHttpError(401, "Invalid or expired token");
    }

    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      throw createHttpError(400, "Title, description, category, and location coordinates are required");
    }

    const newServiceRequest = await this._userService.createServiceRequest(
      decodedUser.id,
      title,
      description,
      imageUrl || "", 
      latitude!,
      longitude!,
      category,
      "pending" // Default status
    );

    // 5. Success Response
    res.status(201).json({
      message: "Service request created successfully",
      data: newServiceRequest[0], // Drizzle usually returns an array
    });

  } catch (error) {
    console.error("Error in createRequest controller:", error);
    next(error);
  }
};

  login: RequestHandler<unknown, unknown, { email: string; password: string }> =
    async (req, res, next) => {
      const { email, password } = req.body;
      try {
        if (!email || !password) {
          throw createHttpError(400, "Fields are Required");
        }
        const getUser = await this._userService.getUserByEmail(email);
        if (getUser.length == 0) {
          throw createHttpError(404, "User doesn't exist");
        }
        const passwordValid = await new HashPasswordService().comparePassword(
          password,
          getUser[0].password,
        );
        if (!passwordValid) {
          res.status(404).json({ error: "Incorrect password" });
          return;
        }

        const accessToken = this._jwtService.generateAccessToken({
          id: getUser[0].id,
          name: getUser[0].name,
          role: getUser[0].role,
        });
        const refreshToken = this._jwtService.generateRefreshToken({
          id: getUser[0].id,
          name: getUser[0].name,
          role: getUser[0].role,
        });

        res.cookie("token", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
          token: accessToken,
          message: "Login Successful",
          data: {
            id: getUser[0].id,
            name: getUser[0].name,
            role: getUser[0].role,
          },
        });
        return;
      } catch (error) {
        console.error("error: ", error);
        next(error);
      }
    };

getRequestsByUserId: RequestHandler = async (req, res, next) => {
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

    const authorizedRoles = ["citizen", "admin"];
    if (!authorizedRoles.includes(decodedUser.role)) {
      throw createHttpError(403, "Only a citizen or admin can see details about the serviceRequest");
    }

    const serviceRequests = await this._userService.getServiceByUserId(decodedUser.id);

    res.status(200).json({
      message: "Requests retrieved successfully",
      role: decodedUser.role,
      data: serviceRequests,
    });

  } catch (error) {
    console.error("Error in getRequestsByUserId:", error);
    next(error);
  }
};

  refresh: RequestHandler<unknown, unknown, unknown, unknown> = async (
    req,
    res,
    next,
  ) => {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "refresh token not found" });
    }

    try {
      const decoded = this._jwtService.verifyToken(token);

      const { iat, exp, ...payloadForNewToken } = decoded;

      const newAccessToken =
        this._jwtService.generateAccessToken(payloadForNewToken);

      res
        .status(200)
        .json({ accessToken: newAccessToken, userId: payloadForNewToken });
    } catch (error) {
      res.clearCookie("token");
      next(error);
    }
  };

  logout: RequestHandler<unknown, unknown, unknown, unknown> = async (
    req,
    res,
    next,
  ) => {
    try {
      console.log(req.cookies);

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });

      res.status(200).json({ data: "Logout successful" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
}
