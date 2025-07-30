import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { Product } from "../models/product.model.js";

export const uploadProductVideo = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const owner = req.user;

    if (!title || !description || !price) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const videoFile = req.files?.video?.[0];
    const imageFiles = req.files?.images || [];

    if (!videoFile) {
      return res
        .status(400)
        .json({ message: "videoFile not found in local path", success: false });
    }

    // upload video
    const videoResponse = await uploadOnCloudinary(videoFile.path);

    if (!videoResponse) {
      return res
        .status(500)
        .json({
          message: "Error while uploading video on cloudinary",
          success: false,
        });
    }

    // upload images
    const imageResponse = await Promise.all(
      imageFiles.map((file) => uploadOnCloudinary(file.path))
    );

    // create entry in db
    const newProduct = await Product.create({
      title,
      description,
      price,
      images: imageResponse.map((img) => img.secure_url),
      imagesPublic_id: imageResponse.map((img) => img.public_id),
      video: videoResponse.secure_url,
      videoPublic_id: videoResponse.public_id,
      owner: owner._id,
    });

    if (!newProduct) {
      return res
        .status(500)
        .json({ message: "Error while creating new product", success: false });
    }

    return res
      .status(201)
      .json({
        message: "New product created successfully",
        success: true,
        newProduct,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error while uploading video", success: false });
  }
};
