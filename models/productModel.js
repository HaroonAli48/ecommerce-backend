import mongoose from "mongoose";

const twoDecimal = (val) => parseFloat(Number(val).toFixed(2));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  price: { type: Number, required: true, set: twoDecimal },
  discount: { type: Number, default: 0, set: twoDecimal },
  bestseller: { type: Boolean },
  sizes: { type: Array, required: true },
  colours: { type: Array, required: true },
  image: { type: Array, required: true },
  date: { type: Number, required: true },
  stock: { type: Boolean, default: true },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;
