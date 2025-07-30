import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized request. Please login!",
        success: false,
      });
    }

    // This will throw if token is invalid/expired
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid token: user not found",
        success: false,
      });
    }

    // OPTIONAL: only if you're storing accessToken in DB
    if (user.accessToken !== token) {
      return res.status(401).json({
        message: "Token mismatch! Please login again.",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("verifyJwt error:", error);
    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
      success: false,
    });
  }
};

export const verifyBrand = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({
        message: "Unauthorized: Please login",
        success: false,
      });
    }

    if (user.role !== "brand") {
      return res.status(403).json({
        message: "Access denied: Only brands can access this feature",
        success: false,
      });
    }

    // Role is brand, proceed
    next();
  } catch (error) {
    console.error("verifyBrand error:", error);
    return res.status(500).json({
      message: "Internal server error in verifyBrand",
      success: false,
    });
  }
};
