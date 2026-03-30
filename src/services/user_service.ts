import {
  getServiceByUserId,
  insertServiceRequest,
  insertUser,
  Login,
  NewRequest,
  NewUser,
  selectUserByEmail,
} from "..";
import HashPasswordService from "../utils/hash_password";
export class UserService {
  async createUser(
    name: string,
    password: string,
    email: string,
    role: "citizen" | "admin" | "agent" | "manager" | null | undefined,
  ) {
    const service = new HashPasswordService();
    const hashedPassword = await service.hashPassword(password);
    const newUser: NewUser = {
      name: name,
      password: hashedPassword,
      email: email,
      role: role,
    };

    const neUser = await insertUser(newUser);
    console.log(neUser);
    return neUser;
  }
  async getUserByEmail(email: string) {
    return await selectUserByEmail(email);
  }
  async login(email: string, password: string) {
    return await Login(email, password);
  }
  async createServiceRequest(
    citizenId: string,
    title: string,
    description: string,
    imageUrl: string,
    latitude: number,
    longitude: number,
    category: string,
    status: string = "pending",
  ) {
    const newRequest: NewRequest = {
      citizen_id: citizenId,
      title: title,
      description: description,
      imageUrl: imageUrl,
      latitude: latitude,
      longitude: longitude,
      category: category,
      status: status,
    };

    try {
      const createdRequest = await insertServiceRequest(newRequest);

      return createdRequest;
    } catch (error) {
      console.error("Failed to insert service request:", error);
      throw error;
    }
  }

    async getServiceByUserId(id: string) {
      const getServiceById= await getServiceByUserId(id);
      return getServiceById;
  
  }

}
