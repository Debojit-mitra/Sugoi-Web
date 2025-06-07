const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../config/logger");
const { URLSearchParams } = require("url");

/**
 * MAL Scraper Service - JavaScript implementation of the Python scraper
 */
class AnimeScraperService {
  constructor() {
    // Base MAL URLs
    this.BASE_URL = "https://myanimelist.net";
    this.MAL_TOP_ANIME = `${this.BASE_URL}/topanime.php`;
    this.MAL_TOP_AIRING = `${this.BASE_URL}/topanime.php?type=airing`;
    this.MAL_TOP_UPCOMING = `${this.BASE_URL}/topanime.php?type=upcoming`;
    this.MAL_TOP_TV_SERIES = `${this.BASE_URL}/topanime.php?type=tv`;
    this.MAL_TOP_MOVIES = `${this.BASE_URL}/topanime.php?type=movie`;
    this.MAL_TOP_OVA = `${this.BASE_URL}/topanime.php?type=ova`;
    this.MAL_TOP_ONA = `${this.BASE_URL}/topanime.php?type=ona`;
    this.MAL_TOP_SPECIAL = `${this.BASE_URL}/topanime.php?type=special`;
    this.MAL_MOST_POPULAR = `${this.BASE_URL}/topanime.php?type=bypopularity`;
    this.MAL_MOST_FAVORITED = `${this.BASE_URL}/topanime.php?type=favorite`;
    this.ANIME_SEASON = `${this.BASE_URL}/anime/season`;
    this.ANIME_SCHEDULE = `${this.BASE_URL}/anime/season/schedule`;
    this.SEARCH_URL = `${this.BASE_URL}/anime.php`;

    this.GENRE_MAPPING = {
      action: 1,
      adventure: 2,
      "avant garde": 5,
      "award winning": 46,
      "boys love": 28,
      comedy: 4,
      drama: 8,
      fantasy: 10,
      "girls love": 26,
      gourmet: 47,
      horror: 14,
      mystery: 7,
      romance: 22,
      "sci-fi": 24,
      "slice of life": 36,
      sports: 30,
      supernatural: 37,
      suspense: 41,
      ecchi: 9,
      erotica: 49,
      hentai: 12,
    };

    this.TYPE_MAPPING = {
      tv: 1,
      ova: 2,
      movie: 3,
      special: 4,
      ona: 5,
      music: 6,
    };

    this.DEMOGRAPHIC_MAPPING = {
      josei: 43,
      kids: 15,
      seinen: 42,
      shoujo: 25,
      shounen: 27,
    };

    this.EXPLICIT_GENRES = new Set(["ecchi", "erotica", "hentai"]);
    this.EXPLICIT_GENRE_IDS = [9, 49, 12];
  }

  /**
   * Get the current season and year
   * @returns {Object} { season, year }
   */
  getSeasonAndYear() {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const year = now.getFullYear();

    let season;
    if (month >= 1 && month <= 3) {
      season = "winter";
    } else if (month >= 4 && month <= 6) {
      season = "spring";
    } else if (month >= 7 && month <= 9) {
      season = "summer";
    } else {
      season = "fall";
    }

    logger.debug(`Current season: ${season}, year: ${year}`);
    return { season, year };
  }

  /**
   * Transform image URL to get larger image
   * @param {String} url - Small image URL
   * @returns {String} - Transformed URL for larger image
   */
  transformImageUrl(url) {
    if (!url) return null;

    logger.debug(`Transforming URL: ${url}`);

    let transformedUrl = url;
    const rIndex = url.indexOf("r/");

    if (rIndex !== -1) {
      const endIndex = url.indexOf("/", rIndex + 2);
      if (endIndex !== -1) {
        transformedUrl = url.slice(0, rIndex) + url.slice(endIndex + 1);
      }
    }

    // Split by '?' and take the first part
    transformedUrl = transformedUrl.split("?")[0];

    logger.debug(`Transformed URL: ${transformedUrl}`);
    return transformedUrl;
  }

  /**
   * Clean text by removing newlines and brackets
   * @param {String} text - Text to clean
   * @returns {String} - Cleaned text
   */
  cleanText(text) {
    logger.debug("Cleaning text");
    let cleaned = text.replace(/\\r/g, "").replace(/\\n/g, "");
    cleaned = cleaned.replace(/\s*\[.*?\]$/, "");
    return cleaned;
  }

  /**
   * Make HTTP GET request with error handling
   * @param {String} url - URL to request
   * @param {Object} params - URL parameters
   * @returns {Promise<Object>} - Response data
   */
  async makeRequest(url, params = {}) {
    try {
      const response = await axios.get(url, {
        params,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (response.status !== 200) {
        logger.error(
          `Failed to fetch data from ${url}. Status code: ${response.status}`
        );
        throw new Error(
          `Failed to fetch data. Status code: ${response.status}`
        );
      }

      return response.data;
    } catch (error) {
      logger.error(`Error making request to ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse anime data from HTML
   * @param {String} html - HTML content
   * @param {Number} page - Current page
   * @param {Number} totalPages - Total pages
   * @returns {Object} - Parsed anime data
   */
  parseAnimeData(html, page, totalPages) {
    logger.debug("Parsing anime data from HTML");
    const $ = cheerio.load(html);
    const animeList = [];

    $("tr.ranking-list").each((i, row) => {
      const rankElem = $(row).find("td.rank span");
      const titleElem = $(row).find("td.title div.detail a.hoverinfo_trigger");
      const imgElem = $(row).find("td.title img");
      const scoreElem = $(row).find("td.score span");
      const infoDiv = $(row).find("div.information");

      const rank = rankElem.length ? rankElem.text().trim() : "N/A";
      const title = titleElem.length ? titleElem.text().trim() : "N/A";
      const url = titleElem.length ? titleElem.attr("href") : "N/A";
      const imageSmallUrl = imgElem.length ? imgElem.attr("data-src") : "N/A";
      const imageUrl = this.transformImageUrl(imageSmallUrl);
      const score = scoreElem.length ? scoreElem.text().trim() : "N/A";

      const animeId = url.match(/\/(anime)\/(\d+)/)?.[2] || "";

      // Extract type and episodes similar to the Java implementation
      let animeType = "N/A";
      let episodes = "N/A";

      if (infoDiv.length) {
        // Split the HTML content by <br> tags
        const infoHtml = infoDiv.html();
        if (infoHtml) {
          const infoLines = infoHtml.split("<br>");
          if (infoLines.length >= 1) {
            // Extract the first line which contains type and episodes
            const firstLine = infoLines[0].trim();
            // Split by the opening parenthesis for episodes
            const typeAndEpisodesParts = firstLine.split(/\s+\(/);

            // The first part is the anime type
            animeType = typeAndEpisodesParts[0].trim();

            // If there's a second part, it contains episodes
            if (typeAndEpisodesParts.length == 2) {
              // Remove closing parenthesis and "eps" text
              episodes = typeAndEpisodesParts[1].replace("eps)", "").trim();
            }
          }
        }
      }

      animeList.push({
        animeId,
        rank,
        title,
        url,
        imageSmallUrl,
        imageUrl,
        score,
        type: animeType,
        episodes,
      });
    });

    logger.info(`Successfully parsed ${animeList.length} anime entries`);
    return {
      page,
      totalPages,
      totalResultsHere: animeList.length,
      results: animeList,
    };
  }

  /**
   * Scrape top anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopAnime(page = 1) {
    logger.info(`Scraping top anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_ANIME}?limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape top airing anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopAiring(page = 1) {
    logger.info(`Scraping top airing anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_AIRING}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 5);
  }

  /**
   * Scrape top upcoming anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopUpcoming(page = 1) {
    logger.info(`Scraping top upcoming anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_UPCOMING}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 10);
  }

  /**
   * Scrape top TV series anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopTVSeries(page = 1) {
    logger.info(`Scraping top TV series anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_TV_SERIES}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape top anime movies list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopMovies(page = 1) {
    logger.info(`Scraping top anime movies list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_MOVIES}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape top OVA anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopOVA(page = 1) {
    logger.info(`Scraping top OVA anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_OVA}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape top ONA anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopONA(page = 1, totalPages = 1) {
    logger.info(`Scraping top ONA anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_ONA}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape top special anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeTopSpecial(page = 1, totalPages = 1) {
    logger.info(`Scraping top special anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_TOP_SPECIAL}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape most popular anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeMostPopular(page = 1, totalPages = 1) {
    logger.info(`Scraping most popular anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_MOST_POPULAR}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Scrape most favorited anime list
   * @param {Number} page - Page number
   * @returns {Promise<Object>} - Parsed anime data
   */
  async scrapeMostFavorited(page = 1, totalPages = 1) {
    logger.info(`Scraping most favorited anime list for page ${page}`);

    const limit = (page - 1) * 50;
    const url = `${this.MAL_MOST_FAVORITED}&limit=${limit}`;

    const html = await this.makeRequest(url);
    return this.parseAnimeData(html, page, 50);
  }

  /**
   * Parse anime season data
   * @param {String} html - HTML content
   * @param {Number} year - Year
   * @param {String} season - Season
   * @param {String} scrapeType - Type of scrape ('season' or 'schedule')
   * @returns {Object} - Parsed season data
   */
  parseAnimeSeasonData(html, year, season, scrapeType) {
    logger.debug(`Parsing anime ${scrapeType} data`);

    const $ = cheerio.load(html);
    let types = {};

    if (scrapeType === "season") {
      types = {
        "TV (New)": [],
        "TV (Continuing)": [],
        ONA: [],
        OVA: [],
        Movie: [],
        Special: [],
      };
    } else {
      types = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
        Other: [],
        Unknown: [],
      };
    }

    $(".seasonal-anime-list").each((_, animeList) => {
      const categoryElem = $(animeList).find("div.anime-header");
      const category = categoryElem.length
        ? categoryElem.text().trim()
        : "Unknown";

      $(animeList)
        .find("div.seasonal-anime")
        .each((_, anime) => {
          const url = $(anime).find("a.link-title").attr("href") || "N/A";
          const title =
            $(anime).find("h2.h2_anime_title").text().trim() || "N/A";

          const animeId = url.match(/\/(anime)\/(\d+)/)?.[2] || "";

          const imageElem = $(anime).find("img");
          const imageUrl =
            imageElem.attr("src") || imageElem.attr("data-src") || "N/A";

          const score = $(anime).find(".score").text().trim() || "N/A";

          // Extract episodes from info span items, similar to Java implementation
          let episodes = "?";
          const infoElements = $(anime).find("div.info span.item");
          if (infoElements.length > 1) {
            const episodeText = $(infoElements[1]).text().trim();
            const episodeParts = episodeText.split(" eps");
            if (episodeParts.length > 0) {
              episodes = episodeParts[0].trim();
            }
          }

          const genres = [];
          $(anime)
            .find(".genre a")
            .each((_, genreElem) => {
              genres.push($(genreElem).text());
            });

          const adultGenres = ["ecchi", "erotica", "hentai"];
          const adult = genres.some((genre) =>
            adultGenres.includes(genre.toLowerCase())
          );

          let synopsis = $(anime).find(".preline").text().trim() || "N/A";
          synopsis = this.cleanText(synopsis);

          // Studios
          let studios = [];
          const studioElems = $(anime)
            .find(".properties .property")
            .filter(
              (_, el) =>
                $(el).find(".caption").text().trim().toLowerCase() ===
                  "studio" ||
                $(el).find(".caption").text().trim().toLowerCase() === "studios"
            )
            .find(".item a");

          studioElems.each((_, el) => {
            studios.push($(el).text().trim());
          });

          // Date
          let date = "N/A";
          const dateElem = $(anime).find(".prodsrc .info .item").first();
          if (dateElem.length) {
            date = dateElem.text().trim();
          }

          const animeData = {
            animeId,
            url,
            title,
            imageUrl,
            score,
            episodes,
            adult,
            genres,
            synopsis,
            studios,
            date,
          };

          if (types[category]) {
            types[category].push(animeData);
          }
        });
    });

    const totalResults = Object.values(types).reduce(
      (sum, animes) => sum + animes.length,
      0
    );

    logger.info(
      `Successfully parsed ${totalResults} anime entries for ${scrapeType}`
    );

    return {
      totalResults,
      year,
      season,
      results: types,
    };
  }

  /**
   * Scrape anime season data
   * @param {Number} year - Year (optional)
   * @param {String} season - Season (optional)
   * @returns {Promise<Object>} - Parsed season data
   */
  async scrapeAnimeSeason(year = null, season = null) {
    logger.info(
      `Scraping anime season data for year: ${year}, season: ${season}`
    );

    let url = this.ANIME_SEASON;

    if (year && season) {
      url = `${this.ANIME_SEASON}/${year}/${season}`;
    } else {
      const { season: currentSeason, year: currentYear } =
        this.getSeasonAndYear();
      season = currentSeason;
      year = currentYear;
      url = `${this.ANIME_SEASON}/${year}/${season}`;
    }

    const html = await this.makeRequest(url);
    return this.parseAnimeSeasonData(html, year, season, "season");
  }

  /**
   * Scrape anime schedule data
   * @returns {Promise<Object>} - Parsed schedule data
   */
  async scrapeAnimeSchedule() {
    logger.info("Scraping anime schedule data");

    const url = this.ANIME_SCHEDULE;
    const { season, year } = this.getSeasonAndYear();

    const html = await this.makeRequest(url);
    return this.parseAnimeSeasonData(html, year, season, "schedule");
  }

  /**
   * Parse search results
   * @param {String} html - HTML content
   * @param {Number} page - Current page
   * @param {Number} limit - Results per page
   * @returns {Object} - Parsed search results
   */
  parseSearchResults(html, page, limit) {
    logger.debug("Parsing search results");

    const $ = cheerio.load(html);
    const animeList = [];
    let totalPages = page; // Default to current page

    // Select rows
    $("div.js-categories-seasonal table tr").each((_, row) => {
      const hasBorderClass =
        $(row).find("td.borderClass.bgColor0, td.borderClass.bgColor1").length >
        0;

      if (!hasBorderClass) return;

      const image = $(row).find("td:nth-child(1) img");
      const imageSmall = image.attr("data-src");
      const imageLarge = this.transformImageUrl(imageSmall || "");

      const titleDiv = $(row).find("td:nth-child(2)");
      const typeCell = $(row).find("td:nth-child(3)");
      const epsCell = $(row).find("td:nth-child(4)");
      const scoreCell = $(row).find("td:nth-child(5)");

      if (
        !image.length ||
        !titleDiv.length ||
        !typeCell.length ||
        !epsCell.length ||
        !scoreCell.length
      )
        return;

      const titleLink = titleDiv.find("a.hoverinfo_trigger");
      const synopsisDiv = titleDiv.find("div.pt4");

      const animeData = {
        title: titleLink.length ? titleLink.text().trim() : "Not Available",
        url: titleLink.length ? titleLink.attr("href") : "Not Available",
        animeId: titleLink.length
          ? titleLink.attr("href").match(/\/anime\/(\d+)/)?.[1]
          : null,
        imageSmall: imageSmall || null,
        imageLarge: imageLarge,
        type: typeCell.text().trim() || "Not Available",
        episodes: epsCell.text().trim() || "Not Available",
        score: scoreCell.text().trim() || "No Rating",
        synopsis: synopsisDiv.length
          ? synopsisDiv.text().trim()
          : "Not Available",
      };

      animeList.push(animeData);
    });

    // Check for pagination
    const pagination = $(".normal_header .fl-r.di-ib");
    if (pagination.length) {
      pagination.find("a").each((_, link) => {
        const linkText = $(link).text().trim();

        if (/^\d+$/.test(linkText)) {
          totalPages = Math.max(totalPages, parseInt(linkText, 10));
        }

        if (
          $(link).is(":last-child") &&
          linkText.startsWith("[") &&
          linkText.endsWith("]")
        ) {
          try {
            totalPages = Math.max(
              totalPages,
              parseInt(linkText.slice(1, -1), 10)
            );
          } catch (e) {
            // Keep current value if parsing fails
          }
        }
      });
    }

    logger.info(`Successfully parsed ${animeList.length} search results`);

    // Manually limit the results array to the requested limit
    const limitedResults = limit ? animeList.slice(0, limit) : animeList;

    return {
      page,
      totalPages,
      limit,
      totalResultsHere: limitedResults.length,
      totalParsedResults: animeList.length, // Store the original count
      results: limitedResults,
    };
  }

  /**
   * Search for anime
   * @param {String} query - Search query
   * @param {Object} options - Search options
   * @param {Number} options.page - Page number (default: 1)
   * @param {String} options.type - Anime type (tv, movie, ova, etc)
   * @param {Number} options.score - Minimum score
   * @param {String} options.status - Airing status
   * @param {Array} options.genre - Genre list
   * @param {String} options.demographic - Target demographic
   * @param {Boolean} options.adult - Whether to include adult content
   * @param {String} options.startDate - Start date in YYYY-MM-DD format
   * @param {String} options.endDate - End date in YYYY-MM-DD format
   * @param {Number} options.limit - Results per page (default: 50)
   * @returns {Promise<Object>} - Parsed search results
   */
  async searchAnime(
    query,
    {
      page = 1,
      type = null,
      score = null,
      status = null,
      genre = null,
      demographic = null,
      adult = null,
      startDate = null,
      endDate = null,
      limit = 50,
    } = {}
  ) {
    logger.info(`Searching anime with query: '${query}', page: ${page}`);

    const params = {
      q: query,
      cat: "anime",
    };

    // Add type parameter
    if (type) {
      type = type.toLowerCase();
      if (this.TYPE_MAPPING[type]) {
        params.type = this.TYPE_MAPPING[type];
      } else {
        logger.warning(`Invalid type: ${type}`);
        throw new Error(
          `Invalid type: ${type}. Valid types are: ${Object.keys(
            this.TYPE_MAPPING
          ).join(", ")}`
        );
      }
    }

    // Add score parameter
    if (score) {
      params.score = score;
    }

    // Add status parameter
    if (status) {
      params.status = status;
    }

    // Add genre parameter
    if (genre && Array.isArray(genre)) {
      const genreIds = [];

      for (const g of genre) {
        const gLower = g.toLowerCase();
        if (this.GENRE_MAPPING[gLower]) {
          const genreId = this.GENRE_MAPPING[gLower];
          // Exclude explicit genres if adult is true
          if (adult === false && this.EXPLICIT_GENRES.has(gLower)) {
            continue;
          }
          genreIds.push(genreId);
        } else {
          logger.warning(`Invalid genre: ${g}`);
          throw new Error(
            `Invalid genre: ${g}. Valid genres are: ${Object.keys(
              this.GENRE_MAPPING
            ).join(", ")}`
          );
        }
      }

      if (genreIds.length > 0) {
        params["genre[]"] = genreIds;
      }
    }

    // Add date parameters
    if (startDate) {
      try {
        const date = new Date(startDate);
        params.sd = date.getDate();
        params.sm = date.getMonth() + 1;
        params.sy = date.getFullYear();
      } catch (e) {
        logger.warning(`Invalid start_date format: ${startDate}`);
        throw new Error("Invalid start_date format. Use YYYY-MM-DD.");
      }
    }

    if (endDate) {
      try {
        const date = new Date(endDate);
        params.ed = date.getDate();
        params.em = date.getMonth() + 1;
        params.ey = date.getFullYear();
      } catch (e) {
        logger.warning(`Invalid end_date format: ${endDate}`);
        throw new Error("Invalid end_date format. Use YYYY-MM-DD.");
      }
    }

    // Add demographic parameter
    if (demographic) {
      const demoLower = demographic.toLowerCase();
      if (this.DEMOGRAPHIC_MAPPING[demoLower]) {
        params["genre[]"] = [this.DEMOGRAPHIC_MAPPING[demoLower]];
      } else {
        logger.warning(`Invalid demographic: ${demographic}`);
        throw new Error(
          `Invalid demographic: ${demographic}. Valid demographics are: ${Object.keys(
            this.DEMOGRAPHIC_MAPPING
          ).join(", ")}`
        );
      }
    }

    // Exclude explicit genres if adult is true
    if (adult === false) {
      params["genre_ex[]"] = this.EXPLICIT_GENRE_IDS;
    }

    // Add show parameter (pagination) with custom limit
    params.show = (page - 1) * limit;

    // Ensure limit doesn't exceed MAL's maximum (100)
    const effectiveLimit = Math.min(limit, 100);
    params.limit = effectiveLimit;

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${this.SEARCH_URL}?${queryString}`;

    //console.log("Full URL:", fullUrl); // Log the full URL
    const html = await this.makeRequest(this.SEARCH_URL, params);

    return this.parseSearchResults(html, page, limit);
  }

  /**
   * Scrape anime details by ID
   * @param {Number} animeId - Anime ID
   * @returns {Promise<Object>} - Anime details
   */
  async scrapeAnimeDetails(animeId) {
    logger.info(`Scraping anime details for ID: ${animeId}`);

    const url = `${this.BASE_URL}/anime/${animeId}`;
    const html = await this.makeRequest(url);

    return this.parseAnimeDetails(html, animeId);
  }

  /**
   * Parse anime details from HTML
   * @param {String} html - HTML content
   * @param {Number} animeId - Anime ID
   * @returns {Object} - Parsed anime details
   */
  parseAnimeDetails(html, animeId) {
    logger.debug(`Parsing anime details for ID: ${animeId}`);

    const $ = cheerio.load(html);
    const details = {};

    // Title
    const titleElem = $("h1.title-name strong");
    details.title = titleElem.length ? titleElem.text().trim() : "";

    // English Title
    const englishTitle = $("p.title-english");
    details.englishTitle = englishTitle.length
      ? englishTitle.text().trim()
      : "";

    // Image
    const imageElem = $("div.leftside img");
    details.image = imageElem.length
      ? imageElem.attr("data-src") || imageElem.attr("src")
      : "";

    // Added: Trailer URL
    const youtubeElement = $("a.iframe.js-fancybox-video");
    details.trailerUrlYoutube = youtubeElement.length
      ? youtubeElement.attr("href").trim()
      : null;

    // Information section
    const infoBlock = $('div[id="content"] table');
    if (!infoBlock.length) {
      logger.error("Could not find information block");
      throw new Error("Could not find information block");
    }

    // Helper function to get information
    const getInfo = (selector, defaultValue = "Unknown") => {
      const elem = infoBlock.find(selector);
      if (elem.length) {
        const nextElem = elem.next();
        if (nextElem.is("a")) {
          return nextElem.text().trim();
        }
        return elem.get(0).nextSibling
          ? $(elem.get(0).nextSibling).text().trim()
          : defaultValue;
      }
      return defaultValue;
    };

    details.type = getInfo('span:contains("Type:")');
    details.episodes = getInfo('span:contains("Episodes:")');
    details.status = getInfo('span:contains("Status:")');
    details.aired = getInfo('span:contains("Aired:")');
    details.premiered = getInfo('span:contains("Premiered:")');
    details.broadcast = getInfo('span:contains("Broadcast:")');
    details.source = getInfo('span:contains("Source:")');
    details.duration = getInfo('span:contains("Duration:")');
    details.rating = getInfo('span:contains("Rating:")');

    // Extract producers
    details.producers = {};
    $('div.spaceit_pad:has(> span.dark_text:contains("Producers:"))').each(
      (_, div) => {
        $(div)
          .find("a")
          .each((_, link) => {
            const name = $(link).text().trim();
            const url = new URL($(link).attr("href"), this.BASE_URL).toString();
            details.producers[name] = url;
          });
      }
    );

    // Extract studios
    details.studios = {};
    $('div.spaceit_pad:has(> span.dark_text:contains("Studios:"))').each(
      (_, div) => {
        $(div)
          .find("a")
          .each((_, link) => {
            const name = $(link).text().trim();
            const url = new URL($(link).attr("href"), this.BASE_URL).toString();
            details.studios[name] = url;
          });
      }
    );

    // Helper function to get list information
    const getListInfo = (selector) => {
      const list = [];
      $(`${selector} ~ a`).each((_, item) => {
        list.push($(item).text().trim());
      });
      return list;
    };

    details.licensors = getListInfo('span:contains("Licensors:")');
    details.genres = getListInfo('span:contains("Genres:")');
    // Added: Fallback for singular "Genre:" if "Genres:" is empty
    if (details.genres.length === 0) {
      details.genres = getListInfo('span:contains("Genre:")');
    }
    details.themes = getListInfo('span:contains("Theme:")');
    details.demographics = getListInfo('span:contains("Demographic:")');

    // Score and stats
    const scoreElem = $("div.score-label");
    details.score = scoreElem.length ? scoreElem.text().trim() : "";

    const rankedElem = $("span.ranked strong");
    details.ranked = rankedElem.length ? rankedElem.text().trim() : "";

    const popularityElem = $("span.popularity strong");
    details.popularity = popularityElem.length
      ? popularityElem.text().trim()
      : "";

    // Synopsis
    const synopsisElem = $('p[itemprop="description"]');
    details.synopsis = synopsisElem.length
      ? synopsisElem.text().trim()
      : "No synopsis available";

    // Added: Parse related entries
    details.relatedEntries = this.parseRelatedEntries($);

    // Added: Parse characters and voice actors
    details.characters = this.parseCharacters($);

    // Added: Parse opening and ending themes
    details.musicThemes = this.parseThemes($);

    // Added: Parse recommendations
    details.recommendations = this.parseRecommendations($);

    logger.info(`Successfully parsed details for anime ID: ${animeId}`);
    return details;
  }

  /**
   * Parse related anime/manga entries
   * @param {CheerioStatic} $ - Cheerio object
   * @returns {Object} - Map of relation type to list of related entries
   */
  parseRelatedEntries($) {
    const relatedEntries = {};

    // Parse tile format entries
    const relatedEntriesDiv = $("div.related-entries");
    if (relatedEntriesDiv.length) {
      const entriesTile = relatedEntriesDiv.find("div.entries-tile");
      if (entriesTile.length) {
        entriesTile.find("div.entry").each((_, entry) => {
          const relationElem = $(entry).find("div.relation");
          const titleElem = $(entry).find("div.title a");
          const imgElem = $(entry).find("div.image a img");

          if (relationElem.length && titleElem.length) {
            let relation = relationElem.text().trim();
            const title = titleElem.text().trim();
            const url = new URL(
              titleElem.attr("href"),
              this.BASE_URL
            ).toString();
            let type = relation;

            if (relation.includes("(")) {
              relation = relation
                .substring(0, relation.lastIndexOf("("))
                .trim();
            }

            let imageUrl = null;
            if (imgElem.length) {
              if (imgElem.attr("data-srcset")) {
                imageUrl = imgElem
                  .attr("data-srcset")
                  .split(",")[1]
                  .trim()
                  .split(" ")[0];
              } else if (imgElem.attr("data-src")) {
                imageUrl = imgElem.attr("data-src");
              } else {
                imageUrl = imgElem.attr("src");
              }

              // Extract base image URL if needed
              imageUrl = this.extractBaseImageUrl(imageUrl);
            }

            const id = url.match(/\/(anime|manga)\/(\d+)/)?.[2] || "";

            const relatedEntry = { id, title, url, type, imageUrl };

            if (!relatedEntries[relation]) {
              relatedEntries[relation] = [];
            }
            relatedEntries[relation].push(relatedEntry);
          }
        });
      }

      // Parse table format entries
      // const entriesTable = relatedEntriesDiv.find("table.entries-table");
      // if (entriesTable.length) {
      //   entriesTable.find("tr").each((_, row) => {
      //     const relationCell = $(row).find("td.ar.fw-n");
      //     const entriesCell = $(row).find("td:nth-child(2)");

      //     if (relationCell.length && entriesCell.length) {
      //       const relation = relationCell.text().trim().replace(":", "");

      //       entriesCell.find("ul.entries li a").each((_, link) => {
      //         const title = $(link).text().trim();
      //         const url = new URL(
      //           $(link).attr("href"),
      //           this.BASE_URL
      //         ).toString();

      //         // Extract type from the text next to the link
      //         let type = "Unknown";
      //         const parentText = $(link).parent().text();
      //         if (parentText.includes("(") && parentText.includes(")")) {
      //           type = parentText
      //             .substring(
      //               parentText.lastIndexOf("(") + 1,
      //               parentText.lastIndexOf(")")
      //             )
      //             .trim();
      //         }

      //         const relatedEntry = { title, url, type, imageUrl: null };

      //         if (!relatedEntries[relation]) {
      //           relatedEntries[relation] = [];
      //         }
      //         relatedEntries[relation].push(relatedEntry);
      //       });
      //     }
      //   });
      // }
    }

    return relatedEntries;
  }

  /**
   * Parse character information and voice actors
   * @param {CheerioStatic} $ - Cheerio object
   * @returns {Array} - List of character objects
   */
  parseCharacters($) {
    const characters = [];
    const charBlocks = $(
      "div.detail-characters-list .left-column, div.detail-characters-list .left-right"
    );

    charBlocks.each((_, column) => {
      const tables = $(column).find("table");

      for (let i = 0; i < tables.length; i += 2) {
        const charTable = $(tables[i]);
        const vaTable = i + 1 < tables.length ? $(tables[i + 1]) : null;

        const charImg = charTable.find("td:first-child img");
        const charInfo = charTable.find("td:nth-child(2)");

        if (charInfo.length && charImg.length && charInfo.find("h3").length) {
          const nameLink = charInfo.find("h3 a");
          const name = nameLink.length ? nameLink.text().trim() : "Unknown";
          const url = nameLink.length
            ? new URL(nameLink.attr("href"), this.BASE_URL).toString()
            : null;

          let imageUrl = "";
          if (charImg.attr("data-srcset")) {
            imageUrl = this.getSecondUrlFromSrcSet(charImg.attr("data-srcset"));
          } else {
            imageUrl = charImg.attr("src");
          }
          imageUrl = this.extractBaseImageUrl(imageUrl);

          const roleElem = charInfo.find("div.spaceit_pad small");
          const role = roleElem.length ? roleElem.text().trim() : "N/A";

          const voiceActors = [];
          if (vaTable) {
            const vaInfo = vaTable.find("tr");
            if (vaInfo.length) {
              const vaName = vaInfo.find("td.va-t a");
              const vaImg = vaInfo.find("td:last-child img");
              const vaLang = vaInfo.find("td.va-t small");

              if (vaName.length && vaImg.length) {
                const vaImageUrl = vaImg.attr("data-src") || vaImg.attr("src");
                voiceActors.push({
                  name: vaName.text().trim(),
                  url: new URL(vaName.attr("href"), this.BASE_URL).toString(),
                  imageUrl: vaImageUrl,
                  language: vaLang.length ? vaLang.text().trim() : "N/A",
                });
              }
            }
          }

          characters.push({ name, url, imageUrl, role, voiceActors });
        }
      }
    });

    return characters;
  }

  /**
   * Helper function to extract second URL from srcset attribute
   * @param {String} srcSet - srcset attribute value
   * @returns {String} - URL
   */
  getSecondUrlFromSrcSet(srcSet) {
    const urls = srcSet.split(",");
    if (urls.length > 1) {
      // Extract the URL portion before the space
      return urls[1].trim().split(" ")[0];
    }
    return srcSet; // Fallback in case no second URL is found
  }

  /**
   * Parse opening and ending theme music
   * @param {CheerioStatic} $ - Cheerio object
   * @returns {Object} - Map of theme types to lists of themes
   */
  parseThemes($) {
    const themes = {
      opening: [],
      ending: [],
    };

    const themeBlocks = $("div.theme-songs");
    themeBlocks.each((_, block) => {
      const themeType = $(block).hasClass("opnening") ? "opening" : "ending";
      const rows = $(block).find("table tr");

      rows.each((_, row) => {
        const mainCell = $(row).find("td:nth-of-type(2)");
        if (!mainCell.length) return;

        const cellText = mainCell.text().trim();
        if (!cellText.includes('"') && !cellText.includes("by")) return;

        const indexElem = $(row).find("span.theme-song-index");
        let number = "Unknown";
        if (indexElem.length) {
          number = indexElem.text().trim().replace(":", "");
        } else if (cellText.startsWith("S")) {
          number = cellText.split(":")[0].trim();
        }

        let title = "Unknown";
        let artist = "Unknown";
        let episodes = null;
        const platforms = {};

        // Extract title and artist
        const parts = cellText.split("by");
        if (parts.length >= 2) {
          title = parts[0].replace(/"/g, "").trim();
          artist = parts[1].replace(/\([^)]*\)/g, "").trim();
        }

        // Extract episodes
        if (cellText.includes("(eps")) {
          const start = cellText.indexOf("(eps") + 4;
          const end = cellText.indexOf(")", start);
          if (end > start) {
            episodes = cellText.substring(start, end).trim();
          }
        }

        // Extract platforms
        const platformTypes = ["spotify", "apple", "amazon", "youtube"];
        for (const platform of platformTypes) {
          const input = $(row).find(`input[id^=${platform}_url_]`);
          if (input.length && input.attr("value")) {
            platforms[platform] = input.attr("value");
          }
        }

        themes[themeType].push({ number, title, artist, episodes, platforms });
      });
    });

    return themes;
  }

  /**
   * Parse recommendations
   * @param {CheerioStatic} $ - Cheerio object
   * @returns {Array} - List of recommendation objects
   */
  parseRecommendations($) {
    const recommendations = [];
    const recBlocks = $(
      "div #anime_recommendation div.anime-slide-outer ul.anime-slide li.btn-anime"
    );

    recBlocks.each((_, block) => {
      try {
        const titleElem = $(block).find("span.title");
        const title = titleElem.length ? titleElem.text().trim() : "N/A";

        const urlElem = $(block).find("a");
        const url = urlElem.length
          ? new URL(urlElem.attr("href"), this.BASE_URL).toString()
          : "";

        const animeId = url.match(/\/anime\/(\d+)/)?.[1];

        // animeId = (url) => {
        //   const match = url.match(/\/anime\/(\d+)/);
        //   return match?.[1] || "";
        // };

        const imgElem = $(block).find("img");
        let imageUrl = "";
        if (imgElem.length) {
          imageUrl = imgElem.attr("data-src") || imgElem.attr("src");
          imageUrl = this.extractBaseImageUrl(imageUrl);
        }

        const usersElem = $(block).find("span.users");
        const recommenders = usersElem.length
          ? usersElem.text().trim().split(" ")[0]
          : "0";

        recommendations.push({ animeId, title, url, imageUrl, recommenders });
      } catch (e) {
        logger.error("Error processing recommendation", e);
      }
    });

    return recommendations;
  }

  /**
   * Helper function to extract base image URL
   * @param {String} url - Image URL
   * @returns {String} - Base image URL
   */
  extractBaseImageUrl(url) {
    if (url.includes("/r/")) {
      url = url.replace(/\/r\/\d+x\d+\//, "/"); // remove resizing path
    }
    if (url.includes("?")) {
      url = url.split("?")[0]; // remove query parameters
    }
    return url;
  }
}

module.exports = new AnimeScraperService();
