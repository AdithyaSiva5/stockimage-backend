import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyJWTToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {

  const token: string | undefined = req.cookies && req.cookies.access_token;


  if (!token) {
    return res.status(401).json("You need to Login");
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, user?: any) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      req.user = user;
      next();
    }
  );
};
