import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const options = {
      amount: order.totalPrice * 100,
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder =
      await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = "Razorpay";

    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    res.json({
      message: "Payment successful",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};