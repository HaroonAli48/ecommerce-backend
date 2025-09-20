import categoryModel from "../models/categoryModel.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const categoryDoc = await categoryModel.findOne();

    if (!categoryDoc) {
      return res.status(404).json({ message: "Category document not found" });
    }

    if (categoryDoc.category.includes(name)) {
      return res.status(400).json({ message: "Category already exists" });
    }

    categoryDoc.category.push(name);
    await categoryDoc.save();

    res.status(201).json({
      message: "Category added successfully",
      category: categoryDoc.category,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.findOne();
    res.status(200).json({ category: categories.category, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const categoryDoc = await categoryModel.findOne();

    if (!categoryDoc) {
      return res.status(404).json({ message: "Category document not found" });
    }

    const index = categoryDoc.category.indexOf(name);
    if (index === -1) {
      return res.status(400).json({ message: "Category does not exist" });
    }

    categoryDoc.category.splice(index, 1);
    await categoryDoc.save();

    res.status(200).json({
      message: "Category deleted successfully",
      category: categoryDoc.category,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};

export const addSubCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid subcategory name" });
    }
    const subcategoryDoc = await categoryModel.findOne();
    if (!subcategoryDoc) {
      return res
        .status(404)
        .json({ message: "Subcategory document not found" });
    }

    if (subcategoryDoc.subCategory.includes(name)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    subcategoryDoc.subCategory.push(name);
    await subcategoryDoc.save();

    res.status(201).json({
      message: "Subcategory added successfully",
      subcategory: subcategoryDoc.subCategory,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating subcategory",
      error: error.message,
    });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const subcategoriesDoc = await categoryModel.findOne();

    const subCategories = subcategoriesDoc.subCategory || [];
    res.status(200).json({ subCategory: subCategories, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching subcategories",
      error: error.message,
    });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid subcategory name" });
    }

    const subcategoryDoc = await categoryModel.findOne();
    if (!subcategoryDoc) {
      return res
        .status(404)
        .json({ message: "Subcategory document not found" });
    }

    const index = subcategoryDoc.subCategory.indexOf(name);
    if (index === -1) {
      return res.status(400).json({ message: "Subcategory does not exist" });
    }

    subcategoryDoc.subCategory.splice(index, 1);
    await subcategoryDoc.save();

    res.status(200).json({
      message: "Subcategory deleted successfully",
      subCategory: subcategoryDoc.subCategory,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting subcategory",
      error: error.message,
    });
  }
};

export const addHeading = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid heading name" });
    }

    const categoryDoc = await categoryModel.findOne();
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category document not found" });
    }
    const headingExists = categoryDoc.heading.includes(name);
    if (headingExists) {
      return res.status(400).json({ message: "Heading already exists" });
    }

    const heading = categoryDoc.heading || [];
    heading.push(name);
    categoryDoc.save();
    res.status(201).json({
      message: "Heading added successfully",
      heading: heading,
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding heading",
      error: err.message,
    });
  }
};

export const getHeadings = async (req, res) => {
  try {
    const categoryDoc = await categoryModel.findOne();
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category document not found" });
    }
    const headings = categoryDoc.heading || [];
    res.status(200).json({ heading: headings, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching headings",
      error: error.message,
    });
  }
};

export const deleteHeading = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid heading name" });
    }

    const categoryDoc = await categoryModel.findOne();
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category document not found" });
    }

    const index = categoryDoc.heading.indexOf(name);
    if (index === -1) {
      return res.status(400).json({ message: "Heading does not exist" });
    }

    categoryDoc.heading.splice(index, 1);
    await categoryDoc.save();

    res.status(200).json({
      message: "Heading deleted successfully",
      heading: categoryDoc.heading,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting heading",
      error: error.message,
    });
  }
};
