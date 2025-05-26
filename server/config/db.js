const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true, // Build indexes
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Add event listeners for reconnection status
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected, attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
