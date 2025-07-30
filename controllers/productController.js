import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import ImageModel from "../models/ImageModel.js";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      colours,
      bestseller,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      subCategory,
      price: Number(price),
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes),
      colours: JSON.parse(colours),
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);

    await product.save();

    res.json({ message: "product Added", success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const addImage = async (req, res) => {
  try {
    const urls = await Promise.all(
      ["pic1", "pic2", "pic3"].map(async (key) => {
        if (req.files[key]) {
          const result = await cloudinary.uploader.upload(
            req.files[key][0].path,
            { resource_type: "image" }
          );
          return result.secure_url;
        }
        return null;
      })
    );

    const newImage = new ImageModel({
      pic1: urls[0],
      pic2: urls[1],
      pic3: urls[2],
    });

    await newImage.save();
    res.json({ message: "Images uploaded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Add this in your controller file
const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      colours,
      bestseller,
      stock,
    } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = Number(price);
    if (category !== undefined) updateFields.category = category;
    if (subCategory !== undefined) updateFields.subCategory = subCategory;
    if (sizes !== undefined)
      updateFields.sizes =
        typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    if (colours !== undefined)
      updateFields.colours =
        typeof colours === "string" ? JSON.parse(colours) : colours;
    if (bestseller !== undefined)
      updateFields.bestseller = bestseller === "true" || bestseller === true;
    if (stock !== undefined) updateFields.stock = stock;

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" }, updatedProduct);
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getImages = async (req, res) => {
  try {
    const image = await ImageModel.findOne().sort({ _id: -1 });
    if (!image) return res.status(404).json({ message: "No images found" });

    res.json({
      pic1: image.pic1,
      pic2: image.pic2,
      pic3: image.pic3,
      contentType: image.contentType,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching image", error: err.message });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateStock = async (req, res) => {
  const { id, stock } = req.body;

  await productModel.findByIdAndUpdate(id, { stock });
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "product removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  removeProduct,
  singleProduct,
  listProducts,
  updateStock,
  addImage,
  getImages,
  updateProduct,
};
