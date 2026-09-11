const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/websocket";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Make sure MongoDB is running or set MONGO_URI in backend/.env");
    process.exit(1);
  }
};

module.exports = connectToMongo;
