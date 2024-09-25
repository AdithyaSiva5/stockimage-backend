import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import Image from "../models/imageModel";
import AWS from "aws-sdk";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { AuthenticatedRequest } from "../middleware/verifyJWTToken";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const profileDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ userDetails: user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const MAX_TITLE_LENGTH = 5;
const MAX_FILENAME_LENGTH = 5;

export const uploadImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const titles = req.body.titles as string[];
    const userId = req.user.id;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const highestOrder = await Image.findOne({ userId })
      .sort("-order")
      .select("order");
    let nextOrder = highestOrder ? highestOrder.order + 1 : 0;

    const uploadPromises = files.map(async (file, index) => {

      const truncatedFileName = file.originalname.slice(0, MAX_FILENAME_LENGTH);
      const fileExtension = truncatedFileName.split(".").pop();
      const imageKey = `${uuidv4()}.${fileExtension}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();

      const title = titles[index]
        ? titles[index].slice(0, MAX_TITLE_LENGTH)
        : truncatedFileName;

      const newImage = new Image({
        userId,
        imageUrl: uploadResult.Location,
        imageKey: imageKey,
        title: title,
        order: nextOrder + index,
      });

      return newImage.save();
    });

    const savedImages = await Promise.all(uploadPromises);

    res.status(201).json({
      message: "Images uploaded successfully",
      images: savedImages,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ error: "Error uploading images" });
  }
};

export const getImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const images = await Image.find({ userId }).sort("order");

    res.status(200).json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateImageTitle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user.id;
    const truncatedTitle = title.length > MAX_TITLE_LENGTH ? title.slice(0, MAX_TITLE_LENGTH) : title;

    const image = await Image.findOneAndUpdate(
      { _id: id, userId },          
      { title: truncatedTitle },     
      { new: true }                 
    );

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json(image);
  } catch (error) {
    console.error("Error updating image title:", error);
    res.status(500).json({ error: "Error updating image title" });
  }
};

export const deleteImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findOneAndDelete({ _id: id, userId });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: image.imageKey,
    };

    await s3.deleteObject(params).promise();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Error deleting image" });
  }
};

export const reorderImages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imageIds } = req.body;

    const userId = req.user.id;
    await Promise.all(
      imageIds.map((image: any) =>
        Image.findOneAndUpdate(
          { _id: image.id, userId },
          { order: image.order }
        )
      )
    );

    res.json({ message: "Images reordered successfully" });
  } catch (error) {
    console.error("Error reordering images:", error);
    res.status(500).json({ error: "Error reordering images" });
  }
};

export const uploadMiddleware = upload.array("images");
