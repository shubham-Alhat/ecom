import express from "express";
import {
  getProfile,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/profile").get(verifyJwt, getProfile);

export default router;
