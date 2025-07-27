import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `\n DB connected.. DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("error while connecting to db", error.message);
    process.exit(1);
  }
};

export default connectToDb;
