import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  pic1: String,
  pic2: String,
  pic3: String,
  pic4: String,
  pic5: String,
  pic6: String,
  pic7: String,
  pic8: String,
  pic9: String,
  pic10: String,
  contentType: String,
});

const ImageModel = mongoose.model("Image", ImageSchema);

export default ImageModel;
