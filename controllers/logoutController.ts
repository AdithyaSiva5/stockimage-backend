import { Request, Response, NextFunction } from "express";

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear the access token cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.ENV === "PROD" ? true : false,
      sameSite: process.env.ENV === "PROD" ? "none" : "strict",
    });


    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
