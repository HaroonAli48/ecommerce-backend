import express from "express";
import {
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  placeOrderJazz,
  placeOrderEasy,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import orderModel from "../models/orderModel.js";

const orderRouter = express.Router();

orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/jazz", authUser, placeOrderJazz);
orderRouter.post("/easy", authUser, placeOrderEasy);

orderRouter.post("/guest", async (req, res) => {
  try {
    const { items, amount, address, paymentMethod = "COD" } = req.body;

    const detailedItems = items.map((item) => ({
      productId: item._id || null,
      name: item.name,
      image: item.image,
      size: item.size,
      quantity: item.quantity,
      price: item.price || 0,
    }));

    const orderData = {
      items: detailedItems,
      address,
      amount,
      paymentMethod,
      payment: paymentMethod === "COD" ? false : true,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    res.json({ success: true, message: "Guest Order Placed", order: newOrder });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});

orderRouter.post("/guestjazz", async (req, res) => {
  try {
    const { items, amount, address, paymentMethod = "Jazzcash" } = req.body;

    const detailItems = items.map((item) => ({
      productId: item._id || null,
      name: item.name,
      image: item.image,
      size: item.size,
      quantity: item.quantity,
      price: item.price || 0,
    }));

    const orderData = {
      items: detailItems,
      address,
      amount,
      paymentMethod,
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    res.json({ success: true, message: "Guest Order Placed", order: newOrder });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
});

orderRouter.post("/guesteasy", async (req, res) => {
  try {
    const { items, amount, address, paymentMethod = "Easypaisa" } = req.body;

    const detailItems = items.map((item) => ({
      productId: item._id || null,
      name: item.name,
      image: item.image,
      size: item.size,
      quantity: item.quantity,
      price: item.price || 0,
    }));

    const orderData = {
      items: detailItems,
      address,
      amount,
      paymentMethod,
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    res.json({ success: true, message: "Guest Order Placed", order: newOrder });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
});

orderRouter.post("/guestorders", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const orders = await orderModel
      .find({ "address.phone": phone })
      .sort({ date: -1 });

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        orders: [],
        message: "No orders found for this phone",
      });
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default orderRouter;
