import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Explicitly replace localhost with 127.0.0.1 to force IPv4
    mongoUri = mongoUri.replace('localhost', '127.0.0.1');
    
    console.log(`Trying to connect to MongoDB at: ${mongoUri}`);
    
    // Force IPv4 connection to avoid IPv6 connectivity issues
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      family: 4  // Force IPv4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't exit the process immediately to keep the server running
    // process.exit(1);
  }
};

export default connectDB;
