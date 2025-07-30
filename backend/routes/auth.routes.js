import express from "express";
import { avatarUpload } from "../middlewares/multer.middleware.js";
import {
  getProfile,
  login,
  logout,
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

export default router;
