import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    pic1: String,
    pic2: String,
    pic3: String,
    contentType: String,
});

const ImageModel = mongoose.model('Image', ImageSchema);

export default ImageModel