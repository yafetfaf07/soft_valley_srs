import bcrypt from "bcrypt";

export default class HashPasswordService {
  private readonly saltRounds = 10;
  async  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  async comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}