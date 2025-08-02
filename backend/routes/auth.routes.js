import express from "express";
import { avatarUpload } from "../middlewares/multer.middleware.js";
import {
  addToCart,
  getProfile,
  login,
  logout,
  removeFromCart,
  signup,
  updateAvatar,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/profile").get(verifyJwt, getProfile);
router.route("/update-avatar").put(verifyJwt, avatarUpload, updateAvatar);
router.route("/add-to-cart/:productId").post(verifyJwt, addToCart);
router.route("/remove-from-cart/:cartId").delete(verifyJwt, removeFromCart);

export default router;
