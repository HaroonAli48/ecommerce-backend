import express from "express";
import { addImage, getImages } from "../controllers/productController.js";
import upload from "../middleware/multer.js";

const imagesRouter = express.Router();

imagesRouter.post(
  "/upload",
  upload.fields([
    { name: "pic1", maxCount: 1 },
    { name: "pic2", maxCount: 1 },
    { name: "pic3", maxCount: 1 },
    { name: "pic4", maxCount: 1 },
    { name: "pic5", maxCount: 1 },
    { name: "pic6", maxCount: 1 },
    { name: "pic7", maxCount: 1 },
    { name: "pic8", maxCount: 1 },
    { name: "pic9", maxCount: 1 },
    { name: "pic10", maxCount: 1 },
  ]),
  addImage
);

imagesRouter.get("/latest", getImages);

export default imagesRouter;
