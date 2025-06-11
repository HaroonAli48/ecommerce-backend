import express from 'express'
import { addImage, getImages } from '../controllers/productController.js';
import upload from '../middleware/multer.js';

const imagesRouter = express.Router();

imagesRouter.post('/upload', upload.fields([
  { name: 'pic1', maxCount: 1 },
  { name: 'pic2', maxCount: 1 },
  { name: 'pic3', maxCount: 1 }
]),addImage);

imagesRouter.get('/latest',getImages);

export default imagesRouter