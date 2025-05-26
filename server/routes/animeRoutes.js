const {
  getTopAnime,
  getTopAiring,
  getTopUpcoming,
  getTopTV,
  getTopMovies,
  getTopOVA,
  getTopONA,
  getTopSpecial,
  getMostPopular,
  getMostFavorited,
  getCurrentSeason,
  getSeason,
  getSchedule,
  searchAnime,
  getAnimeDetails,
} = require("../controllers/animeController");

const {
  protect,
  isPremiumOrAdmin,
  isAdmin,
} = require("../middleware/authMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");
const {
  searchLimiter,
  scrapingLimiter,
} = require("../middleware/rateLimitMiddleware");
const { validate, schemas } = require("../middleware/validationMiddleware");

module.exports = (router) => {
  router.get("/api/v1/anime/top", cacheMiddleware(86400), getTopAnime); // 24 hours
  router.get("/api/v1/anime/top-airing", cacheMiddleware(86400), getTopAiring); // 24 hours
  router.get(
    "/api/v1/anime/top-upcoming",
    cacheMiddleware(86400),
    getTopUpcoming
  ); // 24 hours
  router.get("/api/v1/anime/top-tv", cacheMiddleware(86400), getTopTV); // 24 hours
  router.get("/api/v1/anime/top-movies", cacheMiddleware(86400), getTopMovies); // 24 hours
  router.get("/api/v1/anime/top-ova", cacheMiddleware(86400), getTopOVA); // 24 hours
  router.get("/api/v1/anime/top-ona", cacheMiddleware(86400), getTopONA); // 24 hours
  router.get(
    "/api/v1/anime/top-special",
    cacheMiddleware(86400),
    getTopSpecial
  ); // 24 hours
  router.get(
    "/api/v1/anime/most-popular",
    cacheMiddleware(86400),
    getMostPopular
  ); // 24 hours
  router.get(
    "/api/v1/anime/most-favorited",
    cacheMiddleware(86400),
    getMostFavorited
  ); // 24 hours

  // Season and schedule routes
  router.get("/api/v1/anime/season", cacheMiddleware(43200), getCurrentSeason); // 12 hours
  router.get(
    "/api/v1/anime/season/:year/:season",
    cacheMiddleware(43200),
    getSeason
  ); // 12 hours
  router.get("/api/v1/anime/schedule", cacheMiddleware(43200), getSchedule); // 12 hours

  // Search route with rate limiting
  router.get(
    "/api/v1/anime/search",
    searchLimiter,
    cacheMiddleware(43200),
    searchAnime
  ); // 12 hours

  // Anime details route
  router.get("/api/v1/anime/:id", cacheMiddleware(43200), getAnimeDetails); // 12 hours

  // Protected scraping route for premium users and admins
  router.post(
    "/api/v1/anime/scrape",
    protect,
    isAdmin,
    scrapingLimiter,
    (req, res) => {
      // This route can be used to trigger manual scraping if needed
      // Will be implemented later
      res.status(200).json({ success: true, message: "Scraping initiated" });
    }
  );
};
