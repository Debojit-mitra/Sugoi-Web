require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cluster = require("cluster");
const os = require("os");

// Database Connection
const connectDB = require("./config/db");

// Import error handler
const errorHandler = require("./utils/errorHandler");
const logger = require("./config/logger");

// Number of CPU cores (for clustering)
const numCPUs = os.cpus().length;

// Cluster setup for scaling
if (cluster.isMaster && process.env.NODE_ENV === "production") {
  logger.info(`Master ${process.pid} is running`);

  // Fork workers based on CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    logger.warn(`Worker ${worker.process.pid} died - Starting a new worker`);
    cluster.fork();
  });
} else {
  // Create Express App
  const app = express();

  // Security and Optimization Middleware
  app.use(helmet()); // Set security headers
  app.use(compression()); // Compress responses
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Logging
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  });
  app.use("/api/", apiLimiter);

  // Connect to Database
  connectDB();

  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Sugoi backend is running! ",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Basic Health Check Route
  app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Import Routes
  require("./routes/animeRoutes")(app);
  require("./routes/authRoutes")(app);
  require("./routes/userRoutes")(app);
  require("./routes/adminRoutes")(app);

  // 404 Route
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.originalUrl}`,
    });
  });

  // Error Handling Middleware
  app.use(errorHandler);

  // Start Server
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // Graceful Shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });

  process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    logger.error(err.name, err.message);
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
    logger.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}
