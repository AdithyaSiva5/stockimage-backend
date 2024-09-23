import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IUser {
  _id?: ObjectId;
  email: string;
  phoneNumber: number;
  password: string;
  fullName?: string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
    fullName: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
