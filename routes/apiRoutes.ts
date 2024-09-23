// routes/apiRoutes.ts
import express from "express";
import loginRoute from "./loginRoute";
import signUpRoute from "./signupRoute";
import profileRoute from "./profileRoutes";
import { verifyJWTToken } from "../middleware/verifyJWTToken";
import { checkAuth } from "../controllers/checkAuth";
import { logoutUser } from "../controllers/logoutController";
import {
  deleteImage,
  getImages,
  reorderImages,
  updateImageTitle,
  uploadImages,
  uploadMiddleware,
} from "../controllers/profileController";

const router = express.Router();

// Unauthenticated routes
router.use("/login", loginRoute);
router.use("/signup", signUpRoute);

// Authenticated routes
// router.use(verifyJWTToken);
router.use("/profile", verifyJWTToken, profileRoute);
router.get("/check-auth", verifyJWTToken, checkAuth);
router.post("/logout", verifyJWTToken, logoutUser);

router.get("/gallery", verifyJWTToken, getImages);
router.post("/upload-images", verifyJWTToken, uploadMiddleware, uploadImages);
router.put("/gallery/:id", verifyJWTToken, updateImageTitle);
router.delete("/gallery/:id", verifyJWTToken, deleteImage);
router.post("/gallery/reorder", verifyJWTToken, reorderImages);

export default router;
