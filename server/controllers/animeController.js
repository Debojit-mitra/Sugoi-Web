const scraperService = require("../services/scraperService");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errorHandler");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../config/logger");

// @desc    Get top anime list
// @route   GET /api/v1/anime/top
// @access  Public
exports.getTopAnime = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopAnime(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top airing anime
// @route   GET /api/v1/anime/top-airing
// @access  Public
exports.getTopAiring = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopAiring(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top airing anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top upcoming anime
// @route   GET /api/v1/anime/top-upcoming
// @access  Public
exports.getTopUpcoming = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopUpcoming(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top upcoming anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top TV series anime
// @route   GET /api/v1/anime/top-tv
// @access  Public
exports.getTopTV = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopTVSeries(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top TV series anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top anime movies
// @route   GET /api/v1/anime/top-movies
// @access  Public
exports.getTopMovies = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopMovies(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top anime movies retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top OVA anime
// @route   GET /api/v1/anime/top-ova
// @access  Public
exports.getTopOVA = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopOVA(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top OVA anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top ONA anime
// @route   GET /api/v1/anime/top-ona
// @access  Public
exports.getTopONA = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopONA(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top ONA anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get top special anime
// @route   GET /api/v1/anime/top-special
// @access  Public
exports.getTopSpecial = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeTopSpecial(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Top special anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get most popular anime
// @route   GET /api/v1/anime/most-popular
// @access  Public
exports.getMostPopular = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeMostPopular(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Most popular anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get most favorited anime
// @route   GET /api/v1/anime/most-favorited
// @access  Public
exports.getMostFavorited = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const totalPages = parseInt(req.query.totalPages) || 1;

  const animeData = await scraperService.scrapeMostFavorited(page, totalPages);

  return responseFormatter.success(
    res,
    200,
    "Most favorited anime retrieved successfully",
    animeData.results,
    {
      page: animeData.page,
      totalPages: animeData.totalPages,
      totalResults: animeData.totalResultsHere,
    }
  );
});

// @desc    Get current season anime
// @route   GET /api/v1/anime/season
// @access  Public
exports.getCurrentSeason = asyncHandler(async (req, res, next) => {
  const animeData = await scraperService.scrapeAnimeSeason();

  return responseFormatter.success(
    res,
    200,
    "Current season anime retrieved successfully",
    animeData.results,
    {
      season: animeData.season,
      year: animeData.year,
      totalResults: animeData.totalResults,
    }
  );
});

// @desc    Get specific season anime
// @route   GET /api/v1/anime/season/:year/:season
// @access  Public
exports.getSeason = asyncHandler(async (req, res, next) => {
  const { year, season } = req.params;

  // Validate season parameter
  const validSeasons = ["winter", "spring", "summer", "fall"];
  if (!validSeasons.includes(season.toLowerCase())) {
    return next(
      new AppError(
        `Invalid season. Must be one of: ${validSeasons.join(", ")}`,
        400
      )
    );
  }

  // Validate year parameter
  const yearNum = parseInt(year);
  if (
    isNaN(yearNum) ||
    yearNum < 1990 ||
    yearNum > new Date().getFullYear() + 1
  ) {
    return next(new AppError("Invalid year", 400));
  }

  const animeData = await scraperService.scrapeAnimeSeason(
    yearNum,
    season.toLowerCase()
  );

  return responseFormatter.success(
    res,
    200,
    `${season} ${year} anime retrieved successfully`,
    animeData.results,
    {
      season: animeData.season,
      year: animeData.year,
      totalResults: animeData.totalResults,
    }
  );
});

// @desc    Get anime schedule
// @route   GET /api/v1/anime/schedule
// @access  Public
exports.getSchedule = asyncHandler(async (req, res, next) => {
  const animeData = await scraperService.scrapeAnimeSchedule();

  return responseFormatter.success(
    res,
    200,
    "Anime schedule retrieved successfully",
    animeData.results,
    {
      season: animeData.season,
      year: animeData.year,
      totalResults: animeData.totalResults,
    }
  );
});

// @desc    Search anime
// @route   GET /api/v1/anime/search
// @access  Public
exports.searchAnime = asyncHandler(async (req, res, next) => {
  const {
    q,
    page = 1,
    type,
    score,
    status,
    genre,
    demographic,
    adult,
    startDate,
    endDate,
    limit,
  } = req.query;

  if (!q) {
    return next(new AppError("Search query is required", 400));
  }

  // Parse genres if provided as comma-separated string
  let parsedGenres = null;
  if (genre) {
    parsedGenres = Array.isArray(genre)
      ? genre
      : genre.split(",").map((g) => g.trim());
  }

  const searchOptions = {
    page: parseInt(page),
    type,
    score: score ? parseInt(score) : null,
    status,
    genre: parsedGenres,
    demographic,
    adult: adult === undefined ? true : adult === "true",
    startDate,
    endDate,
    limit: parseInt(limit) || 50,
  };

  try {
    const searchResults = await scraperService.searchAnime(q, searchOptions);

    return responseFormatter.success(
      res,
      200,
      "Search results retrieved successfully",
      searchResults.results,
      {
        query: q,
        page: searchResults.page,
        limit: searchResults.limit,
        totalPages: searchResults.totalPages,
        totalResults: searchResults.totalResultsHere,
        totalAvailableResults:
          searchResults.totalParsedResults || searchResults.totalResultsHere,
      }
    );
  } catch (error) {
    logger.error(`Search error: ${error.message}`);

    if (error.message.includes("Invalid")) {
      return next(new AppError(error.message, 400));
    }

    throw error;
  }
});

// @desc    Get anime details
// @route   GET /api/v1/anime/:id
// @access  Public
exports.getAnimeDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate anime ID
  const animeId = parseInt(id);
  if (isNaN(animeId) || animeId <= 0) {
    return next(new AppError("Invalid anime ID", 400));
  }

  try {
    const animeDetails = await scraperService.scrapeAnimeDetails(animeId);

    return responseFormatter.success(
      res,
      200,
      "Anime details retrieved successfully",
      animeDetails
    );
  } catch (error) {
    logger.error(`Error fetching anime details: ${error.message}`);

    if (error.message.includes("Failed to fetch anime details")) {
      return next(new AppError("Anime not found or unavailable", 404));
    }

    throw error;
  }
});
