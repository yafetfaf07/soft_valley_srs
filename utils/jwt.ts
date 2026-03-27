import jwt from 'jsonwebtoken';
export class JwtAuthService  {
    
  private readonly secret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.secret =process.env.JWT_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new Error('Invalid Token');
    }
  }

  verifyAccessToken(token: string): any {
    try {
        return jwt.verify(token, this.secret); // Uses JWT_SECRET
    } catch (error) {
        throw new Error('Invalid Access Token');
    }
}
}