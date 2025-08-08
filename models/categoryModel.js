import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  category: {
    type: Array,
    required: true,
    unique: true,
  },
  subCategory: {
    type: Array,
    required: true,
    unique: true,
  },
  heading: {
    type: Array,
  },
});

const categoryModel = mongoose.model("Category", CategorySchema);

export default categoryModel;
