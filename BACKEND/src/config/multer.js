import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars", // nome della cartella su Cloudinary per gli avatar
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "limit" }],
  },
});

const upload = multer({ storage });


const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "covers", // cartella separata per le cover
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

const uploadCover = multer({ storage: coverStorage });

export default upload;
export { uploadCover };