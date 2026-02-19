import multer from "multer";

const storage = multer.memoryStorage();

export const upload1 = multer({
  storage,
});
