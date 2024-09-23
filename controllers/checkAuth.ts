import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/verifyJWTToken";  

export const checkAuth = (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "User is not authenticated" });
  }
};
