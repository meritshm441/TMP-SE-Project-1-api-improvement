import multer from "multer";
import { ErrorResponse } from "../utils/error.js";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${file.mimetype.split("/")[1]}`
    );
  },
});

const imageExtensions = ["png", "jpeg", "jpg"];

const verifyImageFile = (file) =>
  imageExtensions.includes(file.mimetype.split("/")[1]);

const onlyImage = (req, file, cb) => {
  if (file) {
    const isImage = verifyImageFile(file);

    if (isImage) {
      cb(null, true);
    } else {
      cb(new ErrorResponse("Only image file is supported", 400));
    }
  }
};

const uploadImage = multer({
  storage: storage,
  fileFilter: onlyImage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB file size limit
});

export const uploadSingleImageFile = (fieldName) =>
  uploadImage.single(fieldName);
