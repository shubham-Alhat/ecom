import app from "./app.js";
import dotenv from "dotenv";
import connectToDb from "../db/connection.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectToDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });
});
