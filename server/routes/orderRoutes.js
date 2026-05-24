import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from "../controllers/orderController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* customer */

router.post("/cart", protect, addToCart);
router.get("/cart", protect, getCart);
router.put("/cart/:productId", protect, updateCartItem);
router.delete("/cart/:productId", protect, removeCartItem);

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);

/* admin */

router.get("/admin/all", protect, adminOnly, getAllOrders);

router.put(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

router.get(
  "/admin/dashboard/stats",
  protect,
  adminOnly,
  getDashboardStats
);
router.get("/:id", protect, getOrderById);

export default router;