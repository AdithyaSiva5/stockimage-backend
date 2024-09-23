// models/imageModel.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IImage extends Document {
  userId: string;
  imageUrl: string;
  imageKey: string;
  title: string;
  order: number;
  createdAt: Date;
}

const imageSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },
  imageKey: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model<IImage>("Image", imageSchema);

export default Image;
