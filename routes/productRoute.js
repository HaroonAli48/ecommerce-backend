import express from "express";
import {
  addProduct,
  removeProduct,
  singleProduct,
  listProducts,
  updateStock,
  updateProduct,
} from "../controllers/productController.js";
import { upload1 } from "../middleware/upload.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();
productRouter.post(
  "/add",
  adminAuth,
  upload1.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
    { name: "image4" },
  ]),
  addProduct,
);
productRouter.post("/remove", removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
productRouter.post(
  "/edit",
  adminAuth,
  upload1.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
    { name: "image4" },
  ]),
  updateProduct,
);
productRouter.post("/update", updateStock);

export default productRouter;
