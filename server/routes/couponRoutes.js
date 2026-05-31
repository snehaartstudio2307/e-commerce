import express from "express";
import {
  createCoupon,
  getCoupons,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, getCoupons);
router.delete("/:id", protect, adminOnly, deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
