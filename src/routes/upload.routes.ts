import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { upload } from "../middleware/upload.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = Router();

router.post("/", verifyAuth, upload.single("image"), uploadImage);

export default router;
