import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";

interface UserSignup {
  email: string;
  password: string;
  phoneNumber: number;
  fullName?: string;
}

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userSignupData: UserSignup = req.body;
  console.log(req.body, "req.body");
  const hashedPassword = bcrypt.hashSync(userSignupData.password, 10);

  try {
    const existingUser = await User.findOne({ email: userSignupData.email });

    if (!existingUser) {
      const newUser = new User({
        email: userSignupData.email,
        password: hashedPassword,
        phoneNumber: userSignupData.phoneNumber,
        fullName: userSignupData.fullName,
      });

      await newUser.save();

      return res.status(201).json({ user: newUser });
    } else {
      return res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    console.error("Error during user signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
