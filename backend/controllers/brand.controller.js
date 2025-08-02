import { uploadOnCloudinary } from "../lib/cloudinary.js";
import deleteLocalImages from "../lib/deleteImages.js";
import { Product } from "../models/product.model.js";
import fs from "fs";

export const createNewProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const owner = req.user;

    if (!title || !description || !price) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const videoFile = req.file;

    if (!videoFile) {
      return res
        .status(400)
        .json({ message: "videoFile not found in local path", success: false });
    }

    // upload video
    const response = await uploadOnCloudinary(videoFile.path);

    if (!response) {
      return res.status(500).json({
        message: "Error while uploading video on cloudinary",
        success: false,
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      video: response.secure_url,
      videoPublic_id: response.public_id,
      owner: owner._id,
    });

    if (!newProduct) {
      return res
        .status(500)
        .json({ message: "Error while creating product", success: false });
    }

    return res.status(201).json({
      message: "New product created successfully",
      success: true,
      newProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Error while creating new product",
      success: false,
    });
  }
};

export const addPhotosForPoduct = async (req, res) => {
  try {
    const images = req.files;

    if (!images) {
      return res
        .status(400)
        .json({ message: "Images not found", success: false });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
        success: false,
      });
    }

    const uploadedImages = [];

    for (const image of images) {
      const result = await uploadOnCloudinary(image.path);
      if (result) {
        uploadedImages.push({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: { images: { $each: uploadedImages } },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        message: "Error while uploading images for product",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Images uploaded for product succesfuly",
      success: true,
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal error while uploading images",
      success: false,
    });
  }
};

export const getBrandProduct = async (req, res) => {
  try {
    const brandId = req.user._id;

    if (!brandId) {
      return res
        .status(400)
        .json({ message: "Can't Authorized.", success: false });
    }

    const allProducts = await Product.find({ owner: brandId });

    return res
      .status(200)
      .json({
        message: "All products fetched successfully",
        success: true,
        allProducts,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal error while fetching products",
      success: false,
    });
  }
};
