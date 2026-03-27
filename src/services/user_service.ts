import { insertUser, Login, NewUser, selectUserByEmail } from "..";
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
}
