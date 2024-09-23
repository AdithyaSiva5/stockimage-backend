import { Request, Response, NextFunction, CookieOptions } from "express";
import User from "../models/userModel";
import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email: email });
    if (!validUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!validUser.password) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ id: validUser._id }, jwtSecret, {
      expiresIn: "1h",
    });
    const expiryDate = new Date(Date.now() + 36000000);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.ENV == "PROD" ? true : false, // Must be true when sameSite is 'none'
      sameSite: process.env.ENV == "PROD" ? "none" : "strict", // Allows cross-site cookies
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    res.cookie("access_token", token, cookieOptions);
    res
      .status(200)
      .json({ message: "Authentication successful", user: validUser });
  } catch (error) {
    next(error);
  }
};
