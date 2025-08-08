import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import images from "./routes/images.js";
import { initiatePayment } from "./controllers/orderController.js";
import categoryRouter from "./routes/categoryRoute.js";

// app config
const app = express();
const port = process.env.PORT || 8080;
connectDB();
connectCloudinary();

//middlewares
app.use(express.json());
app.use(cors());

//api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/images", images);
app.use("/api/category", categoryRouter);

import bodyParser from "body-parser";

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// JazzCash Merchant Credentials (Use your sandbox keys here)
const merchantID = "MC150525";
const password = "123456"; // API Password
const integritySalt = "YourIntegritySaltHere"; // Provided by JazzCash Sandbox
const returnURL = "http://localhost:8080/payment/response";

function getDateTime() {
  const now = new Date();
  const formatted = now
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
  return formatted;
}

function generateSecureHash(data, integritySalt) {
  let sorted = "";
  for (let key in data) {
    if (data[key]) {
      sorted += `${data[key]}&`;
    }
  }
  sorted = integritySalt + "&" + sorted.slice(0, -1); // Remove last &
  return crypto.SHA256(sorted).toString(crypto.enc.Hex).toUpperCase();
}

app.get("/pay", (req, res) => {
  const txnRef = "T" + getDateTime();
  const txnDateTime = getDateTime();
  const expiryDateTime = getDateTime(); // Add a few mins ahead in production

  // Build the payload
  const payload = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantID,
    pp_SubMerchantID: "",
    pp_Password: password,
    pp_BankID: "",
    pp_ProductID: "RETL",
    pp_TxnRefNo: txnRef,
    pp_Amount: "10000", // Rs. 100.00 (must be in paisa)
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: "billRef",
    pp_Description: "Test Transaction",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: returnURL,
    pp_SecureHash: "",
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  // Sort keys and generate hash string
  const sortedKeys = Object.keys(payload).sort();
  const sortedPayload = {};
  sortedKeys.forEach((key) => {
    sortedPayload[key] = payload[key];
  });

  payload.pp_SecureHash = generateSecureHash(sortedPayload, integritySalt);

  // Send an HTML form to POST to JazzCash
  const formAction =
    "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

  let form = `<form id="jazzForm" method="post" action="${formAction}">`;
  for (let key in payload) {
    form += `<input type="hidden" name="${key}" value="${payload[key]}" />`;
  }
  form +=
    '</form><script>document.getElementById("jazzForm").submit();</script>';

  res.send(form);
});

app.post("/payment/response", (req, res) => {
  const responseData = req.body;

  console.log("JazzCash Payment Response:", responseData);

  // You can validate responseData here using SecureHash
  // Then redirect to a frontend page or render a success/fail page
  if (responseData.pp_ResponseCode === "000") {
    res.send("✅ Payment Successful!");
  } else {
    res.send(
      "❌ Payment Failed. Response Code: " + responseData.pp_ResponseCode
    );
  }
});

app.post("/api/pay", async (req, res) => {
  const { amount, orderId, phoneNumber } = req.body;

  if (!amount || !orderId || !phoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const paymentResponse = await initiatePayment(amount, orderId, phoneNumber);
  res.json(paymentResponse);
});

app.get("/", (req, res) => {
  res.send("HMH STUDIO ON TOP");
});

app.listen(port, "0.0.0.0", () => console.log("HMH" + port));
