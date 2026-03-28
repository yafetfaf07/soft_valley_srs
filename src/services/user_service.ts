import { insertServiceRequest, insertUser, Login, NewRequest, NewUser, selectUserByEmail } from "..";
import HashPasswordService from "../../utils/hash-password";
export class UserService {
async createUser(
  name: string,
  password: string,
  email: string,
  role: "citizen" | "admin" | "agent" | "manager" | null | undefined,
) {
      const service = new HashPasswordService();
      const hashedPassword = await service.hashPassword(password);
      const newUser: NewUser = { name: name, password: hashedPassword, email: email, role: role };
      
    const neUser= await insertUser(newUser);
    console.log(neUser);
    return neUser;
  }
  async getUserByEmail(email:string) {
    return await selectUserByEmail(email);
  }
  async login(email:string, password:string) {
    return await Login(email,password); 
  }
async createServiceRequest(
  citizenId: string,
  title: string,
  description: string,
  imageUrl: string,
  latitude: number,
  longitude: number,
  category: string,
  status: string = "pending" // Defaulting status if not provided
) {
  // Construct the object based on the NewRequest type
  const newRequest: NewRequest = {
    citizen_id: citizenId,
    title: title,
    description: description,
    imageUrl: imageUrl,
    latitude: latitude,
    longitude: longitude,
    category: category,
    status: status,
    // id and createdAt are omitted as they have defaults in the schema
  };

  try {
    // Assuming insertServiceRequest is your database interaction utility
    const createdRequest = await insertServiceRequest(newRequest);
    
    console.log("Successfully created service request:", createdRequest);
    return createdRequest;
  } catch (error) {
    console.error("Failed to insert service request:", error);
    throw error;
  }
}
}
