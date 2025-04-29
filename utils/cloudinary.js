import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = async (path) => {
  const options = {
    use_filename: true,
    unique_filename: true, 
    overwrite: false,
    resource_type: "auto",
  };
  return await cloudinary.uploader.upload(path, options);
};
