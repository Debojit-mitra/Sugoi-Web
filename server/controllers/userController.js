const User = require("../models/User");
const WatchList = require("../models/WatchList");
const emailService = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errorHandler");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../config/logger");

// @desc    Update user profile
// @route   PUT /api/v1/user/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, profileImage } = req.body;

  // Prevent update of email or role from this endpoint
  if (req.body.email || req.body.role) {
    return next(new AppError("This endpoint cannot update email or role", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, profileImage },
    { new: true, runValidators: true }
  );

  return responseFormatter.success(res, 200, "Profile updated successfully", {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    profileImage: updatedUser.profileImage,
    isEmailVerified: updatedUser.isEmailVerified,
  });
});

// @desc    Delete user account
// @route   DELETE /api/v1/user/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  // Instead of hard deleting, mark the user as deleted
  await User.findByIdAndUpdate(req.user.id, {
    status: "deleted",
    lastActive: Date.now(),
  });

  // We'll keep the watchlist in case the user is reactivated later

  return responseFormatter.success(res, 200, "Account deleted successfully");
});

// @desc    Get user's watchlist
// @route   GET /api/v1/user/watchlist
// @access  Private
exports.getWatchlist = asyncHandler(async (req, res, next) => {
  const watchlist = await WatchList.findOne({ user: req.user.id });

  if (!watchlist) {
    // Create empty watchlist if not exists
    const newWatchlist = await WatchList.create({
      user: req.user.id,
      items: [],
    });

    return responseFormatter.success(
      res,
      200,
      "Watchlist retrieved",
      newWatchlist.items
    );
  }

  return responseFormatter.success(
    res,
    200,
    "Watchlist retrieved",
    watchlist.items
  );
});

// @desc    Add anime to watchlist
// @route   POST /api/v1/user/watchlist
// @access  Private
exports.addToWatchlist = asyncHandler(async (req, res, next) => {
  const { animeId, title, imageUrl, status, totalEpisodes } = req.body;

  // Get user's watchlist
  let watchlist = await WatchList.findOne({ user: req.user.id });

  // Create watchlist if not exists
  if (!watchlist) {
    watchlist = await WatchList.create({
      user: req.user.id,
      items: [],
    });
  }

  // Check if anime already in watchlist
  const animeInWatchlist = watchlist.items.find(
    (item) => item.animeId === animeId
  );

  if (animeInWatchlist) {
    return next(new AppError("Anime already in watchlist", 400));
  }

  // Add anime to watchlist
  watchlist.items.push({
    animeId,
    title,
    imageUrl,
    status: status || "plan_to_watch",
    totalEpisodes: totalEpisodes || null,
    episodesWatched: 0,
    rating: 0,
    startDate: status === "watching" ? new Date() : null,
  });

  await watchlist.save();

  return responseFormatter.success(
    res,
    201,
    "Anime added to watchlist",
    watchlist.items.find((item) => item.animeId === animeId)
  );
});

// @desc    Update watchlist item
// @route   PUT /api/v1/user/watchlist/:animeId
// @access  Private
exports.updateWatchlistItem = asyncHandler(async (req, res, next) => {
  const { animeId } = req.params;
  const { status, rating, episodesWatched, notes } = req.body;

  // Get user's watchlist
  const watchlist = await WatchList.findOne({ user: req.user.id });

  if (!watchlist) {
    return next(new AppError("Watchlist not found", 404));
  }

  // Find anime in watchlist
  const animeIndex = watchlist.items.findIndex(
    (item) => item.animeId === animeId
  );

  if (animeIndex === -1) {
    return next(new AppError("Anime not found in watchlist", 404));
  }

  // Update anime data
  if (status) {
    watchlist.items[animeIndex].status = status;

    // Update start/finish dates based on status
    if (status === "watching" && !watchlist.items[animeIndex].startDate) {
      watchlist.items[animeIndex].startDate = new Date();
    }

    if (status === "completed" && !watchlist.items[animeIndex].finishDate) {
      watchlist.items[animeIndex].finishDate = new Date();
    }
  }

  if (rating !== undefined) {
    watchlist.items[animeIndex].rating = rating;
  }

  if (episodesWatched !== undefined) {
    watchlist.items[animeIndex].episodesWatched = episodesWatched;

    // Auto-update status to completed if all episodes watched
    if (
      watchlist.items[animeIndex].totalEpisodes &&
      episodesWatched >= watchlist.items[animeIndex].totalEpisodes &&
      watchlist.items[animeIndex].status !== "completed"
    ) {
      watchlist.items[animeIndex].status = "completed";
      watchlist.items[animeIndex].finishDate = new Date();
    }
  }

  if (notes !== undefined) {
    watchlist.items[animeIndex].notes = notes;
  }

  await watchlist.save();

  return responseFormatter.success(
    res,
    200,
    "Watchlist item updated",
    watchlist.items[animeIndex]
  );
});

// @desc    Remove anime from watchlist
// @route   DELETE /api/v1/user/watchlist/:animeId
// @access  Private
exports.removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const { animeId } = req.params;

  // Get user's watchlist
  const watchlist = await WatchList.findOne({ user: req.user.id });

  if (!watchlist) {
    return next(new AppError("Watchlist not found", 404));
  }

  // Check if anime exists in watchlist
  const animeIndex = watchlist.items.findIndex(
    (item) => item.animeId === animeId
  );

  if (animeIndex === -1) {
    return next(new AppError("Anime not found in watchlist", 404));
  }

  // Remove anime from watchlist
  watchlist.items.splice(animeIndex, 1);
  await watchlist.save();

  return responseFormatter.success(res, 200, "Anime removed from watchlist");
});

// @desc    Get user's watch history
// @route   GET /api/v1/user/history
// @access  Private
exports.getWatchHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Sort history by most recent first
  const sortedHistory = user.watchHistory.sort((a, b) => b.watched - a.watched);

  return responseFormatter.success(
    res,
    200,
    "Watch history retrieved",
    sortedHistory
  );
});

// @desc    Update watch history
// @route   POST /api/v1/user/history
// @access  Private
exports.updateWatchHistory = asyncHandler(async (req, res, next) => {
  const { animeId, episodeId, timestamp } = req.body;

  if (!animeId || !episodeId) {
    return next(new AppError("Anime ID and Episode ID are required", 400));
  }

  // Get user
  const user = await User.findById(req.user.id);

  // Check if entry already exists
  const historyIndex = user.watchHistory.findIndex(
    (item) => item.animeId === animeId && item.episodeId === episodeId
  );

  if (historyIndex !== -1) {
    // Update existing entry
    user.watchHistory[historyIndex].timestamp = timestamp || 0;
    user.watchHistory[historyIndex].watched = new Date();
  } else {
    // Add new entry
    user.watchHistory.push({
      animeId,
      episodeId,
      timestamp: timestamp || 0,
      watched: new Date(),
    });

    // Limit history to 100 entries
    if (user.watchHistory.length > 100) {
      // Sort by date (oldest first)
      user.watchHistory.sort((a, b) => a.watched - b.watched);
      // Remove oldest entry
      user.watchHistory.shift();
    }
  }

  await user.save({ validateBeforeSave: false });

  return responseFormatter.success(res, 200, "Watch history updated");
});

// @desc    Upgrade user to premium
// @route   POST /api/v1/user/upgrade-premium
// @access  Private
exports.upgradeToPremiun = asyncHandler(async (req, res, next) => {
  // This would typically involve payment processing
  // For this implementation, we'll just upgrade the user status

  if (req.user.role === "premium") {
    return next(new AppError("User is already a premium member", 400));
  }

  if (req.user.role === "admin") {
    return next(new AppError("Admin users do not need premium upgrade", 400));
  }

  // Update user role
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { role: "premium" },
    { new: true }
  );

  // Send premium confirmation email
  try {
    await emailService.sendPremiumConfirmation({
      email: updatedUser.email,
      name: updatedUser.name,
    });
  } catch (error) {
    logger.error(`Error sending premium confirmation email: ${error.message}`);
    // Continue even if email fails
  }

  return responseFormatter.success(
    res,
    200,
    "Account upgraded to premium successfully",
    {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    }
  );
});
