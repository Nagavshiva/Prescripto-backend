import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary, connectCloudinary } from "../config/cloudinary.js";

// 1️⃣ Configure Cloudinary SDK once
connectCloudinary();

const storage = new CloudinaryStorage({
  cloudinary,          // ← pass the configured client here
  params: {
    folder: "DoctorApData",
    allowed_formats: ["jpg", "png", "jpeg"],
    // you can also set public_id, transformation, etc.
  },
});

const upload = multer({ storage });

export default upload;
