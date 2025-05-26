// Import controllers
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
  getSystemStats,
  clearCache,
  triggerScrape,
  createAdmin,
  manageWatchlist,
} = require("../controllers/adminController");

// Import middleware
const { protect, authorize } = require("../middleware/authMiddleware");

module.exports = (router) => {
  // All routes require admin role
  router.use(protect);
  router.use(authorize("admin"));

  // Dashboard & System
  router.get("/api/v1/admin/dashboard", getDashboardStats);
  router.get("/api/v1/admin/system-stats", getSystemStats);
  router.post("/api/v1/admin/clear-cache", clearCache);

  // User Management
  router.get("/api/v1/admin/users/getall", getAllUsers);
  router.get("/api/v1/admin/users/:id", getUserDetails);
  router.put("/api/v1/admin/users/:id/role", updateUserRole);
  router.delete("/api/v1/admin/users/:id/delete", deleteUser);
  router.post("/api/v1/admin/create-admin", createAdmin);

  // Content Management
  router.post("/api/v1/admin/trigger-scrape/:type", triggerScrape);
  router.get("/api/v1/admin/users/:id/watchlist", manageWatchlist);
};
