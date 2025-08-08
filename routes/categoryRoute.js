import express from "express";
import {
  addCategory,
  addHeading,
  addSubCategory,
  deleteCategory,
  deleteHeading,
  deleteSubCategory,
  getCategories,
  getHeadings,
  getSubCategories,
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();
categoryRouter.post("/add", addCategory);
categoryRouter.get("/get", getCategories);
categoryRouter.delete("/delete/:name", deleteCategory);
categoryRouter.get("/getSubCategories", getSubCategories);
categoryRouter.post("/addSubCategory", addSubCategory);
categoryRouter.delete("/deleteSubCategory/:name", deleteSubCategory);
categoryRouter.post("/addHeading", addHeading);
categoryRouter.get("/getHeadings", getHeadings);
categoryRouter.delete("/deleteHeading/:name", deleteHeading);

export default categoryRouter;
