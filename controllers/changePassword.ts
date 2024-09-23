import { Request, Response, NextFunction } from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/userModel';

export const changePassword = async (req: any, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; 

    try {
        const user = await User.findOne({_id:userId});

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const validPassword = bcryptjs.compareSync(oldPassword, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        const hashedNewPassword = bcryptjs.hashSync(newPassword, 10);
        user.password = hashedNewPassword;

        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "An error occurred while changing the password" });
    }
}