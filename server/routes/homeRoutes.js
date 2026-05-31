import express from "express";
import { getHomeConfig, updateHomeConfig } from "../controllers/homeController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getHomeConfig);
router.put("/", protect, adminOnly, upload.single("heroImage"), updateHomeConfig);

export default router;
