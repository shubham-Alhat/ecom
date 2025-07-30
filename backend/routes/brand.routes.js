import express from "express";
import { verifyBrand, verifyJwt } from "../middlewares/auth.middleware.js";
import { productUpload } from "../middlewares/multer.middleware.js";
import { uploadProductVideo } from "../controllers/brand.controller.js";

const router = express.Router();

router
  .route("/upload/product")
  .post(verifyJwt, verifyBrand, productUpload, uploadProductVideo);

export default router;
