import { unlink, access } from "fs/promises";
import path from "path";

// Sanitize + restrict base directory
const tempDir = path.resolve("public/temp");

const deleteLocalImages = async (images) => {
  for (const image of images) {
    try {
      if (!image?.path) continue;

      const resolvedPath = path.resolve(image.path);

      // Restrict deletion to only inside ./public/temp
      if (!resolvedPath.startsWith(tempDir)) {
        console.warn(
          "Attempt to delete file outside allowed directory:",
          resolvedPath
        );
        continue;
      }

      await access(resolvedPath); // Check file exists
      await unlink(resolvedPath);
      console.log("Deleted:", resolvedPath);
    } catch (err) {
      console.error("Error deleting:", image?.path, err.message);
    }
  }
};

export default deleteLocalImages;
