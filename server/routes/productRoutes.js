import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  addReview,
  getWishlist,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/wishlist/me", protect, getWishlist);
router.get("/:id", getProductById);

router.post("/", protect, adminOnly, upload.array("images", 5), createProduct);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  updateProduct,
);

router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/:id/wishlist", protect, toggleWishlist);

router.post("/:id/reviews", protect, addReview);


export default router;
