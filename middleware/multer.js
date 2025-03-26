import multer from 'multer';

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        // Use 'originalname' instead of 'name'
        callback(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

export default upload;
