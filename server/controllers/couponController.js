import Coupon from "../models/Coupon.js";

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;

    if (!code || !discountPercentage) {
      return res.status(400).json({ message: "Code and discount percentage are required" });
    }

    const formattedCode = code.toUpperCase().trim();

    const existingCoupon = await Coupon.findOne({ code: formattedCode });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: formattedCode,
      discountPercentage: Number(discountPercentage),
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.deleteOne();
    res.json({ message: "Coupon removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const formattedCode = code.toUpperCase().trim();

    const coupon = await Coupon.findOne({ code: formattedCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or inactive coupon code" });
    }

    res.json({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
