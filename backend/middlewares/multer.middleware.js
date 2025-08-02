import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// 2. File Filter
const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const videoTypes = ["video/mp4", "video/quicktime"];

  if (
    (file.fieldname === "images" && imageTypes.includes(file.mimetype)) ||
    (file.fieldname === "video" && videoTypes.includes(file.mimetype)) ||
    (file.fieldname === "avatar" && imageTypes.includes(file.mimetype))
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type!"), false);
  }
};

// 3. Upload Config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// ---------- 4. Exported Middleware ----------

// For uploading avatar (1 image)
export const avatarUpload = upload.single("avatar");

export const uploadVideo = upload.single("video");
export const uploadImages = upload.array("images", 5);
