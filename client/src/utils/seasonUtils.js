/**
 * Utility functions for handling anime seasons
 */

/**
 * Get the current season based on the current month
 * @returns {string} The current season: 'winter', 'spring', 'summer', or 'fall'
 */
export const getCurrentSeason = () => {
  const month = new Date().getMonth();
  // Winter: 0,1,2 (Jan-Mar), Spring: 3,4,5 (Apr-Jun),
  // Summer: 6,7,8 (Jul-Sep), Fall: 9,10,11 (Oct-Dec)
  if (month >= 0 && month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "fall";
};

/**
 * Get the season name with properly capitalized format
 * @param {string} season - The season in lowercase: 'winter', 'spring', 'summer', 'fall'
 * @returns {string} Capitalized season name
 */
export const getSeasonName = (season) => {
  if (!season) return "";
  return season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
};

/**
 * Generate a range of years from the current year back to the specified start year
 * @param {number} startYear - The earliest year in the range
 * @returns {number[]} Array of years in descending order
 */
export const getYearRange = (startYear = 2000) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  // Include next year for upcoming seasons
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};

/**
 * Filter anime list by type category
 * @param {Object[]} animeList - Array of anime objects
 * @param {string} typeCategory - Category to filter by ('TV_NEW', 'TV_CONTINUING', 'ONA', etc.)
 * @returns {Object[]} Filtered anime list
 */
export const filterAnimeByType = (animeList, typeCategory) => {
  if (!animeList || animeList.length === 0) {
    return [];
  }

  switch (typeCategory) {
    case "TV_NEW":
      return animeList.filter(
        (anime) => anime.type === "TV" && anime.continuing === false
      );
    case "TV_CONTINUING":
      return animeList.filter(
        (anime) => anime.type === "TV" && anime.continuing === true
      );
    case "ONA":
      return animeList.filter((anime) => anime.type === "ONA");
    case "OVA":
      return animeList.filter((anime) => anime.type === "OVA");
    case "MOVIE":
      return animeList.filter((anime) => anime.type === "Movie");
    case "SPECIAL":
      return animeList.filter((anime) => anime.type === "Special");
    default:
      return animeList;
  }
};
