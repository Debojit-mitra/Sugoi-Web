import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { animeAPI } from "../../services/api";

// Initial state
const initialState = {
  topAnime: [],
  topAiring: [],
  topMovies: [],
  topUpcoming: [],
  mostPopular: [],
  mostFavorited: [],
  currentSeason: {},
  scheduleData: [],
  animeDetails: null,
  viewAllAnime: [], // For view all page
  isLoading: false,
  isPaginationLoading: false, // New state for pagination loading
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 0,
    totalResults: 0,
  },
  viewAllPagination: {
    // Specific pagination for view all page
    page: 1,
    limit: 24,
    totalPages: 0,
    totalResults: 0,
  },
};

// Async thunks
export const fetchTopAnime = createAsyncThunk(
  "anime/fetchTopAnime",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getTopAnime(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch top anime" }
      );
    }
  }
);

export const fetchTopAiring = createAsyncThunk(
  "anime/fetchTopAiring",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getTopAiring(page, limit);
      //console.log("Top airing :", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch top airing anime" }
      );
    }
  }
);

export const fetchTopMovies = createAsyncThunk(
  "anime/fetchTopMovies",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getTopMovies(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch top upcoming anime",
        }
      );
    }
  }
);

export const fetchTopUpcoming = createAsyncThunk(
  "anime/fetchTopUpcoming",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getTopUpcoming(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch top upcoming anime",
        }
      );
    }
  }
);

export const fetchMostPopular = createAsyncThunk(
  "anime/fetchMostPopular",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getMostPopular(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch most popular anime",
        }
      );
    }
  }
);

export const fetchMostFavorited = createAsyncThunk(
  "anime/fetchMostFavorited",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getMostFavorited(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch most favorited anime",
        }
      );
    }
  }
);

export const fetchCurrentSeason = createAsyncThunk(
  "anime/fetchCurrentSeason",
  async (_, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getCurrentSeason();
      //console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch current season anime",
        }
      );
    }
  }
);

export const fetchSeason = createAsyncThunk(
  "anime/fetchSeason",
  async ({ year, season }, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getSeason(year, season);
      //console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch season anime" }
      );
    }
  }
);

export const fetchSchedule = createAsyncThunk(
  "anime/fetchSchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getSchedule();
      // console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch anime schedule" }
      );
    }
  }
);

export const fetchAnimeDetails = createAsyncThunk(
  "anime/fetchAnimeDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await animeAPI.getAnimeDetails(id);
      //console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch anime details" }
      );
    }
  }
);

export const fetchAllAnimeByCategory = createAsyncThunk(
  "anime/fetchAllAnimeByCategory",
  async ({ category, page = 1, limit = 24 }, { rejectWithValue }) => {
    try {
      let response;
      switch (category) {
        case "airing":
          response = await animeAPI.getTopAiring(page, limit);
          break;
        case "upcoming":
          response = await animeAPI.getTopUpcoming(page, limit);
          break;
        case "popular":
          response = await animeAPI.getMostPopular(page, limit);
          break;
        case "top-rated":
          response = await animeAPI.getTopAnime(page, limit);
          break;
        case "movies":
          response = await animeAPI.getTopMovies(page, limit);
          break;
        default:
          return rejectWithValue({ message: "Invalid category" });
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: `Failed to fetch ${category} anime` }
      );
    }
  }
);

// Anime slice
const animeSlice = createSlice({
  name: "anime",
  initialState,
  reducers: {
    clearAnimeDetails: (state) => {
      state.animeDetails = null;
    },
    clearAnimeError: (state) => {
      state.error = null;
    },
    resetViewAllPagination: (state) => {
      state.viewAllAnime = [];
      state.viewAllPagination = {
        page: 1,
        limit: 50,
        totalPages: 0,
        totalResults: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Top Anime
      .addCase(fetchTopAnime.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopAnime.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topAnime = action.payload.data;
        state.pagination = action.payload.meta || state.pagination;
      })
      .addCase(fetchTopAnime.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch top anime";
      })

      // Top Airing
      .addCase(fetchTopAiring.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopAiring.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topAiring = action.payload.data;
        state.pagination = action.payload.meta || state.pagination;
      })
      .addCase(fetchTopAiring.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch top airing anime";
      })

      // Top Movies
      .addCase(fetchTopMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topMovies = action.payload.data;
        state.pagination = action.payload.meta || state.pagination;
      })
      .addCase(fetchTopMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch top airing anime";
      })

      // Top Upcoming
      .addCase(fetchTopUpcoming.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopUpcoming.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topUpcoming = action.payload.data;
        state.pagination = action.payload.meta || state.pagination;
      })
      .addCase(fetchTopUpcoming.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch top upcoming anime";
      })

      // Most Popular
      .addCase(fetchMostPopular.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMostPopular.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mostPopular = action.payload.data;
        state.pagination = action.payload.meta || state.pagination;
      })
      .addCase(fetchMostPopular.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch most popular anime";
      })

      // Most Popular
      .addCase(fetchMostFavorited.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMostFavorited.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mostFavorited = action.payload.data;
        state.pagination = action.payload.meta || state.pagination;
      })
      .addCase(fetchMostFavorited.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch most popular anime";
      })

      // Current Season
      .addCase(fetchCurrentSeason.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSeason.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSeason = action.payload.data;
      })
      .addCase(fetchCurrentSeason.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch current season anime";
      })

      // Season
      .addCase(fetchSeason.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSeason.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSeason = action.payload.data;
      })
      .addCase(fetchSeason.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch season anime";
      })

      // Schedule
      .addCase(fetchSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduleData = action.payload.data;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch anime schedule";
      })

      // Anime Details
      .addCase(fetchAnimeDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnimeDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.animeDetails = action.payload.data;
      })
      .addCase(fetchAnimeDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch anime details";
      })

      // View All Anime by Category
      .addCase(fetchAllAnimeByCategory.pending, (state, action) => {
        // Only set isLoading to true for the initial page load
        // For pagination (page > 1), set isPaginationLoading instead
        if (action.meta.arg.page === 1) {
          state.isLoading = true;
        } else {
          state.isPaginationLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchAllAnimeByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isPaginationLoading = false;

        // If it's the first page, replace the list, otherwise append
        if (action.meta.arg.page === 1) {
          state.viewAllAnime = action.payload.data;
        } else {
          state.viewAllAnime = [...state.viewAllAnime, ...action.payload.data];
        }

        state.viewAllPagination = {
          page: action.meta.arg.page,
          limit: action.meta.arg.limit,
          totalPages: action.payload.meta.totalPages,
          totalResults: action.payload.meta.totalResults,
        };
      })
      .addCase(fetchAllAnimeByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isPaginationLoading = false;
        state.error = action.payload?.message || "Failed to fetch anime";
      });
  },
});

export const { clearAnimeDetails, clearAnimeError, resetViewAllPagination } =
  animeSlice.actions;

export default animeSlice.reducer;
