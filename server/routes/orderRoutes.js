import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  placeOrder,
  getMyOrders,
  getOrderById,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/cart", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart/:productId", protect, updateCartItem);
router.delete("/cart/:productId", protect, removeCartItem);

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

export default router;