import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const user = req.user;

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity || 1);
    } else {
      user.cart.push({
        product: productId,
        quantity: Number(quantity || 1),
      });
    }

    await user.save();

    res.json({
      message: "Added to cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await req.user.populate("cart.product");

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const user = req.user;

    const item = user.cart.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    item.quantity = Number(quantity);

    await user.save();

    res.json({
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const user = req.user;

    user.cart = user.cart.filter(
      (item) =>
        item.product.toString() !== req.params.productId
    );

    await user.save();

    res.json({
      message: "Removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode } = req.body;

    const user = await req.user.populate("cart.product");

    if (!user.cart.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let discountPercentage = 0;
    let couponDoc = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (!couponDoc) {
        return res.status(400).json({
          message: "Invalid or inactive coupon code",
        });
      }
      discountPercentage = couponDoc.discountPercentage;
    }

    let totalPrice = 0;

    const items = user.cart.map((item) => {
      totalPrice += item.product.price * item.quantity;

      return {
        product: item.product._id,
        title: item.product.title,
        image: item.product.images[0]?.url,
        price: item.product.price,
        quantity: item.quantity,
      };
    });

    let discountAmount = 0;
    if (discountPercentage > 0) {
      discountAmount = Math.round(totalPrice * (discountPercentage / 100));
      totalPrice = Math.max(0, totalPrice - discountAmount);
    }

    const order = await Order.create({
      user: user._id,
      items,
      shippingAddress,
      totalPrice,
      couponCode: couponDoc ? couponDoc.code : undefined,
      discountAmount,
    });

    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts =
      await (await import("../models/Product.js")).default.countDocuments();

    const totalUsers =
      await (await import("../models/User.js")).default.countDocuments();

    const orders = await Order.find();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};