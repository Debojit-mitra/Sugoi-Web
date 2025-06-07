import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { animeAPI } from "../../services/api";

// Initial state
const initialState = {
  searchResults: [],
  searchQuery: "",
  isLoading: false,
  isLoadingMore: false, // Specific state for loading additional pages
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 0,
    totalResults: 0,
  },
  recentSearches: [],
  suggestions: [],
  isFetchingSuggestions: false,
  activeFilters: {
    type: null,
    score: null,
    status: null,
    genre: [],
    demographic: null,
    adult: true,
    startDate: null,
    endDate: null,
  },
};

// Async thunks
export const searchAnime = createAsyncThunk(
  "search/searchAnime",
  async (
    { query, page = 1, limit = 20, filters = {} },
    { rejectWithValue }
  ) => {
    try {
      const response = await animeAPI.searchAnime(query, page, limit, filters);
      return {
        data: response.data.data,
        meta: response.data.meta,
        query,
        filters,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Search failed" }
      );
    }
  }
);

// Fetch search suggestions (top 4 results only)
export const fetchSuggestions = createAsyncThunk(
  "search/fetchSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      // Only fetch 4 suggestions with minimal data
      const response = await animeAPI.searchAnime(query, 1, 4);
      //console.log("Suggestions response:", response.data.data);
      return {
        data: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch suggestions" }
      );
    }
  }
);

// Search slice
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.pagination = {
        page: 1,
        limit: 20,
        totalPages: 0,
        totalResults: 0,
      };
    },
    resetSearchPagination: (state) => {
      state.searchResults = [];
      state.pagination = {
        page: 1,
        limit: 20,
        totalPages: 0,
        totalResults: 0,
      };
    },
    clearSearchError: (state) => {
      state.error = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    addRecentSearch: (state, action) => {
      // Add to recent searches and ensure no duplicates
      if (!state.recentSearches.includes(action.payload)) {
        state.recentSearches = [
          action.payload,
          ...state.recentSearches.slice(0, 4),
        ];

        // Save to localStorage if available
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "recentSearches",
            JSON.stringify(state.recentSearches)
          );
        }
      }
    },
    loadRecentSearches: (state) => {
      // Load from localStorage if available
      if (typeof window !== "undefined") {
        const savedSearches = localStorage.getItem("recentSearches");
        if (savedSearches) {
          state.recentSearches = JSON.parse(savedSearches);
        }
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];

      // Remove from localStorage if available
      if (typeof window !== "undefined") {
        localStorage.removeItem("recentSearches");
      }
    },
    setSearchFilter: (state, action) => {
      const { filterName, value } = action.payload;
      state.activeFilters[filterName] = value;
    },
    resetSearchFilters: (state) => {
      state.activeFilters = {
        type: null,
        score: null,
        status: null,
        genre: [],
        demographic: null,
        adult: true,
        startDate: null,
        endDate: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAnime.pending, (state, action) => {
        // Set the appropriate loading state based on the page being requested
        if (action.meta.arg.page === 1) {
          state.isLoading = true;
          state.isLoadingMore = false;
        } else {
          state.isLoadingMore = true;
          // Don't show full page loading for pagination requests
          state.isLoading = false;
        }
        state.error = null;
      })
      .addCase(searchAnime.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;

        // If it's the first page, replace results. Otherwise, append
        if (action.payload.meta?.page === 1) {
          state.searchResults = action.payload.data;
        } else {
          // Append new results to existing
          state.searchResults = [
            ...state.searchResults,
            ...action.payload.data,
          ];
        }

        state.searchQuery = action.payload.query;
        state.pagination = action.payload.meta || state.pagination;

        // Store filters from the search if provided
        if (action.payload.filters) {
          Object.keys(action.payload.filters).forEach((key) => {
            if (
              action.payload.filters[key] !== undefined &&
              action.payload.filters[key] !== null &&
              key in state.activeFilters
            ) {
              state.activeFilters[key] = action.payload.filters[key];
            }
          });
        }

        // Add to recent searches
        if (action.payload.query) {
          if (!state.recentSearches.includes(action.payload.query)) {
            state.recentSearches = [
              action.payload.query,
              ...state.recentSearches.slice(0, 4),
            ];

            // Save to localStorage if available
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "recentSearches",
                JSON.stringify(state.recentSearches)
              );
            }
          }
        }
      })
      .addCase(searchAnime.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload?.message || "Search failed";
      })
      // Handle suggestions fetch actions
      .addCase(fetchSuggestions.pending, (state) => {
        state.isFetchingSuggestions = true;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.isFetchingSuggestions = false;
        state.suggestions = action.payload.data;
      })
      .addCase(fetchSuggestions.rejected, (state) => {
        state.isFetchingSuggestions = false;
        state.suggestions = [];
      });
  },
});

export const {
  setSearchQuery,
  clearSearchResults,
  clearSearchError,
  clearSuggestions,
  addRecentSearch,
  loadRecentSearches,
  clearRecentSearches,
  resetSearchPagination,
  setSearchFilter,
  resetSearchFilters,
} = searchSlice.actions;

export default searchSlice.reducer;
