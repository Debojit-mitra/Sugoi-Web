const mongoose = require("mongoose");
const cluster = require("cluster");
const User = require("../models/User");
const WatchList = require("../models/WatchList");
const scraperService = require("../services/scraperService");
const emailService = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errorHandler");
const responseFormatter = require("../utils/responseFormatter");
const {
  getCacheStats,
  clearCacheByPattern,
  clearAllCache,
} = require("../middleware/cacheMiddleware");
const logger = require("../config/logger");

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // Get user stats
  const totalUsers = await User.countDocuments();
  const premiumUsers = await User.countDocuments({ role: "premium" });
  const adminUsers = await User.countDocuments({ role: "admin" });
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  // Get active users
  const activeThisWeek = await User.countDocuments({
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  // Get watchlist stats
  const totalWatchlists = await WatchList.countDocuments();
  const watchlistsWithItems = await WatchList.countDocuments({
    "items.0": { $exists: true },
  });

  // Aggregate watchlist data
  const watchlistStats = await WatchList.aggregate([
    // Unwind the items array
    { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
    // Group by status
    {
      $group: {
        _id: "$items.status",
        count: { $sum: 1 },
      },
    },
    // Sort by count
    { $sort: { count: -1 } },
  ]);

  const statsByStatus = {};
  watchlistStats.forEach((stat) => {
    if (stat._id) {
      statsByStatus[stat._id] = stat.count;
    }
  });

  // System stats
  const cacheStats = getCacheStats();

  return responseFormatter.success(
    res,
    200,
    "Dashboard statistics retrieved successfully",
    {
      users: {
        total: totalUsers,
        premium: premiumUsers,
        admin: adminUsers,
        newToday: newUsersToday,
        activeThisWeek,
      },
      watchlists: {
        total: totalWatchlists,
        active: watchlistsWithItems,
        statsByStatus,
      },
      system: {
        cacheEntries: cacheStats.keys,
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
      },
    }
  );
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filtering
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.isEmailVerified) {
    filter.isEmailVerified = req.query.isEmailVerified === "true";
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Get total count
  const total = await User.countDocuments(filter);

  // Get users
  const users = await User.find(filter)
    .select("name email role isEmailVerified lastActive createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return responseFormatter.success(
    res,
    200,
    "Users retrieved successfully",
    users,
    {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    }
  );
});

// @desc    Get user details
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "-emailVerificationToken -emailVerificationExpire -resetPasswordToken -resetPasswordExpire -otpCode -otpExpire"
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  return responseFormatter.success(
    res,
    200,
    "User details retrieved successfully",
    user
  );
});

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  // Validate role
  const validRoles = ["user", "premium", "admin"];
  if (!validRoles.includes(role)) {
    return next(
      new AppError(`Role must be one of: ${validRoles.join(", ")}`, 400)
    );
  }

  // Find user
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Prevent modification of own role for safety
  if (user._id.toString() === req.user.id) {
    return next(new AppError("Cannot modify your own role", 403));
  }

  // Update role
  user.role = role;
  await user.save();

  // If upgraded to premium, send premium confirmation email
  if (role === "premium" && user.role !== "premium") {
    try {
      await emailService.sendPremiumConfirmation({
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      logger.error(
        `Error sending premium confirmation email: ${error.message}`
      );
      // Continue even if email fails
    }
  }

  return responseFormatter.success(res, 200, "User role updated successfully", {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Prevent deleting own account from this endpoint
  if (user._id.toString() === req.user.id) {
    return next(
      new AppError("Cannot delete your own account through this endpoint", 403)
    );
  }

  // Delete user's watchlist
  await WatchList.findOneAndDelete({ user: user._id });

  // Delete user
  await user.remove();

  return responseFormatter.success(res, 200, "User deleted successfully");
});

// @desc    Get system statistics
// @route   GET /api/v1/admin/system-stats
// @access  Private/Admin
exports.getSystemStats = asyncHandler(async (req, res, next) => {
  // Get database stats
  const dbStats = await mongoose.connection.db.stats();

  // Get cache stats
  const cacheStats = getCacheStats();

  // Memory usage
  const memoryUsage = process.memoryUsage();

  // System uptime
  const uptime = process.uptime();

  return responseFormatter.success(
    res,
    200,
    "System statistics retrieved successfully",
    {
      database: {
        collections: dbStats.collections,
        documents: dbStats.objects,
        dataSize: `${(dbStats.dataSize / (1024 * 1024)).toFixed(2)} MB`,
        storageSize: `${(dbStats.storageSize / (1024 * 1024)).toFixed(2)} MB`,
        indexes: dbStats.indexes,
        indexSize: `${(dbStats.indexSize / (1024 * 1024)).toFixed(2)} MB`,
      },
      cache: {
        entries: cacheStats.keys,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        memoryUsage: `${(cacheStats.vsize / (1024 * 1024)).toFixed(2)} MB`,
      },
      system: {
        uptime: `${(uptime / 3600).toFixed(2)} hours`,
        rss: `${(memoryUsage.rss / (1024 * 1024)).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / (1024 * 1024)).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / (1024 * 1024)).toFixed(2)} MB`,
        external: `${(memoryUsage.external / (1024 * 1024)).toFixed(2)} MB`,
        workers: Object.keys(cluster.workers || {}).length || 1,
      },
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
    }
  );
});

// @desc    Clear cache
// @route   POST /api/v1/admin/clear-cache
// @access  Private/Admin
exports.clearCache = asyncHandler(async (req, res, next) => {
  const { pattern } = req.body;

  if (pattern) {
    clearCacheByPattern(pattern);
    return responseFormatter.success(
      res,
      200,
      `Cache entries matching "${pattern}" cleared successfully`
    );
  } else {
    clearAllCache();
    return responseFormatter.success(
      res,
      200,
      "All cache entries cleared successfully"
    );
  }
});

// @desc    Trigger scrape
// @route   POST /api/v1/admin/trigger-scrape/:type
// @access  Private/Admin
exports.triggerScrape = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { page = 1 } = req.body;

  let result;

  // Map type to scraper function
  switch (type) {
    case "top-anime":
      result = await scraperService.scrapeTopAnime(page);
      break;
    case "top-airing":
      result = await scraperService.scrapeTopAiring(page);
      break;
    case "top-upcoming":
      result = await scraperService.scrapeTopUpcoming(page);
      break;
    case "top-tv":
      result = await scraperService.scrapeTopTVSeries(page);
      break;
    case "top-movies":
      result = await scraperService.scrapeTopMovies(page);
      break;
    case "season":
      const { year, season } = req.body;
      if (year && season) {
        result = await scraperService.scrapeAnimeSeason(year, season);
      } else {
        result = await scraperService.scrapeAnimeSeason();
      }
      break;
    case "schedule":
      result = await scraperService.scrapeAnimeSchedule();
      break;
    default:
      return next(new AppError(`Invalid scrape type: ${type}`, 400));
  }

  // Clear cache for this type
  clearCacheByPattern(type);

  return responseFormatter.success(
    res,
    200,
    `${type} scrape completed successfully`,
    result
  );
});

// @desc    Create admin user
// @route   POST /api/v1/admin/create-admin
// @access  Private/Admin
exports.createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("Email already registered", 400));
  }

  // Create admin user with verified email
  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
    isEmailVerified: true,
  });

  // Create empty watchlist
  await WatchList.create({
    user: user._id,
    items: [],
  });

  return responseFormatter.success(
    res,
    201,
    "Admin user created successfully",
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  );
});

// @desc    Manage user's watchlist
// @route   GET /api/v1/admin/users/:id/watchlist
// @access  Private/Admin
exports.manageWatchlist = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Get user's watchlist
  const watchlist = await WatchList.findOne({ user: id });

  if (!watchlist) {
    return responseFormatter.success(res, 200, "User has no watchlist", []);
  }

  return responseFormatter.success(
    res,
    200,
    "User watchlist retrieved successfully",
    watchlist.items
  );
});
