import mongoose from 'mongoose';
import { DB_NAME } from '../../constant.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URL}/${DB_NAME}`,
    );
    console.log(
      `\n MongoDB connected successfully to host: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log('MongoDB connection error', error);
    process.exit(1);
  }
};

export default connectDB;
