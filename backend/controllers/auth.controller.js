import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary, uploadOnCloudinary } from "../lib/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";

// function for generating token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    if (!username || !email || !password || !fullName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be atleast 6 characters",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const newUser = await User.create({
      username,
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    if (!newUser) {
      return res
        .status(500)
        .json({ message: "Error while registering new User", success: false });
    }

    const token = createToken(newUser._id);

    newUser.accessToken = token;

    await newUser.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true, // can't be accessed by JS
      secure: process.env.NODE_ENV !== "development", // only HTTPS in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res.status(201).cookie("accessToken", token, options).json({
      message: "User created successfully",
      success: true,
      newUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while signup", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        success: false,
      });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res
        .status(400)
        .json({ message: "Password is incorrect!", success: false });
    }

    const token = createToken(user._id);

    user.accessToken = token;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true, // can't be accessed by JS
      secure: process.env.NODE_ENV !== "development", // only HTTPS in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res.status(200).cookie("accessToken", token, options).json({
      message: "User logged In successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while login", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    const user = req.user;

    const newUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { accessToken: "" } },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict", // CSRF protection
      maxAge: 0,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json({ message: "User logout successfully", success: true, newUser });
  } catch (error) {
    console.log("Error while logout", error);
    return res
      .status(500)
      .json({ message: "Error while logout", success: false });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error while getting profile");
    return res
      .status(500)
      .json({ message: "Error while getting profile info", success: false });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const avatarLocalPath = req.file.path;

    if (!avatarLocalPath) {
      return res
        .status(404)
        .json({ message: "avatar Local path is not found", success: false });
    }

    const response = await uploadOnCloudinary(avatarLocalPath);

    if (!response || !response.secure_url) {
      return res.status(500).json({
        message: "Internal server error while uploading file on cloudinary",
        success: false,
      });
    }

    if (req.user.fileId) {
      await deleteFromCloudinary(req.user.fileId);
    }

    // get the user and upadte avatar
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: response.secure_url,
          fileId: response.public_id,
        },
      },
      {
        new: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(500).json({
        message: "User not found while updating avatar",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User avatar updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while updating avatar", success: false });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        success: false,
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found in db", success: false });
    }

    const newProductInCart = await Cart.create({
      product: product._id,
      user: user._id,
      brand: product.owner,
    });

    if (!newProductInCart) {
      return res
        .status(500)
        .json({ message: "Failed to add a new item in cart", success: false });
    }

    const populatedCart = await newProductInCart.populate([
      "user",
      "brand",
      "product",
    ]);

    if (!populatedCart) {
      return res
        .status(500)
        .json({ message: "Failed to populate fields in Cart", success: false });
    }

    return res.status(200).json({
      message: "Product added in cart successfully",
      success: true,
      populatedCart,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while adding product to cart", success: false });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({
        message: "Product ID is required",
        success: false,
      });
    }

    const deletedCartProduct = await Cart.findByIdAndDelete(cartId);

    if (deletedCartProduct) {
      return res.status(200).json({
        message: "Product removed from cart successfully",
        success: true,
        deletedCartProduct,
      });
    } else {
      return res.status(404).json({
        message: "Cart product not found",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while removing product from cart",
      success: false,
    });
  }
};
