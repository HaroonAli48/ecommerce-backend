import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/r2.js";
import { v4 as uuidv4 } from "uuid";
import productModel from "../models/productModel.js";
import ImageModel from "../models/ImageModel.js";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      category,
      subCategory,
      sizes,
      colours,
      bestseller,
      hotSeller,
    } = req.body;

    const images = [
      req.files.image1?.[0],
      req.files.image2?.[0],
      req.files.image3?.[0],
      req.files.image4?.[0],
    ].filter(Boolean);

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    const imagesUrl = await Promise.all(
      images.map(async (file) => {
        const fileName = `products/${uuidv4()}_${file.originalname}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        return `${process.env.R2_PUBLIC_URL}/${fileName}`;
      }),
    );

    const productData = {
      name,
      description,
      category,
      subCategory,
      price: Number(price),
      discount: Number(discount) || 0,
      bestseller: bestseller === "true" || bestseller === true,
      hotSeller: hotSeller === "true" || hotSeller === true,
      sizes: JSON.parse(sizes),
      colours: JSON.parse(colours),
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ message: "Product added", success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const addImage = async (req, res) => {
  try {
    const urls = await Promise.all(
      Array.from({ length: 10 }, (_, i) => `pic${i + 1}`).map(async (key) => {
        if (!req.files[key]) return null;
        const file = req.files[key][0];
        const fileName = `images/${uuidv4()}_${file.originalname}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        return `${process.env.R2_PUBLIC_URL}/${fileName}`;
      }),
    );

    const newImage = new ImageModel({
      pic1: urls[0],
      pic2: urls[1],
      pic3: urls[2],
      pic4: urls[3],
      pic5: urls[4],
      pic6: urls[5],
      pic7: urls[6],
      pic8: urls[7],
      pic9: urls[8],
      pic10: urls[9],
    });

    await newImage.save();
    res.json({ message: "Images uploaded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      discount,
      category,
      subCategory,
      sizes,
      colours,
      bestseller,
      hotSeller,
      stock,
    } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined)
      updateFields.price = parseFloat(Number(price).toFixed(2));
    if (discount !== undefined)
      updateFields.discount = parseFloat(Number(discount).toFixed(2));
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
    if (hotSeller !== undefined)
      updateFields.hotSeller = hotSeller === "true" || hotSeller === true;
    if (stock !== undefined) updateFields.stock = stock;

    const existingProduct = await productModel.findById(id);
    let images = existingProduct.image || [];

    for (let i = 0; i < 4; i++) {
      const file = req.files?.[`image${i + 1}`]?.[0];

      if (file) {
        const key = `products/${uuidv4()}_${file.originalname}`;

        try {
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          });

          await s3.send(command);

          const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
          images[i] = publicUrl;
        } catch (err) {
          console.error("R2 Upload Error:", err);
        }
      }
    }

    updateFields.image = images;

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true },
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
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
      pic4: image.pic4,
      pic5: image.pic5,
      pic6: image.pic6,
      pic7: image.pic7,
      pic8: image.pic8,
      pic9: image.pic9,
      pic10: image.pic10,
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
