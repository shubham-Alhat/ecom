import express from "express";
import { verifyBrand, verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadImages, uploadVideo } from "../middlewares/multer.middleware.js";
import {
  addPhotosForPoduct,
  createNewProduct,
  getBrandProduct,
} from "../controllers/brand.controller.js";

const router = express.Router();

router
  .route("/upload/product")
  .post(verifyJwt, verifyBrand, uploadVideo, createNewProduct);

router
  .route("/upload/images/:productId")
  .post(verifyJwt, verifyBrand, uploadImages, addPhotosForPoduct);

router.route("/products").get(verifyJwt, verifyBrand, getBrandProduct);

export default router;
