// Import controllers (will implement these later)
const {
  updateProfile,
  deleteAccount,
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  updateWatchHistory,
  getWatchHistory,
  upgradeToPremiun,
} = require("../controllers/userController");

// Import middleware
const {
  protect,
  isAdmin,
  requireEmailVerified,
  requireActiveStatus,
} = require("../middleware/authMiddleware");
const { validate, schemas } = require("../middleware/validationMiddleware");

module.exports = (router) => {
  // All routes are protected
  router.use(protect);
  router.use(requireEmailVerified);
  router.use(requireActiveStatus);

  // Profile routes
  router.put("/api/v1/user/profile/update", updateProfile);
  router.delete("/api/v1/user/profile/delete", deleteAccount);

  // Watchlist routes
  router.get("/api/v1/user/watchlist", getWatchlist);
  router.post(
    "/api/v1/user/watchlist/add",
    validate(schemas.watchlist.addItem),
    addToWatchlist
  );
  router.put(
    "/api/v1/user/watchlist/:animeId/update",
    validate(schemas.watchlist.updateItem),
    updateWatchlistItem
  );
  router.delete("/api/v1/user/watchlist/:animeId/delete", removeFromWatchlist);

  // Watch history routes
  router.get("/api/v1/user/history", getWatchHistory);
  router.post("/api/v1/user/history/update", updateWatchHistory);

  // Premium upgrade route
  router.post("/api/v1/user/upgrade-premium", isAdmin, upgradeToPremiun);
};
