import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../services/api";

// Initial state
const initialState = {
  watchlist: [],
  watchHistory: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  "watchlist/fetchWatchlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getWatchlist();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch watchlist" }
      );
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  "watchlist/addToWatchlist",
  async (animeData, { rejectWithValue }) => {
    try {
      const response = await userAPI.addToWatchlist(animeData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to add to watchlist" }
      );
    }
  }
);

export const updateWatchlistItem = createAsyncThunk(
  "watchlist/updateWatchlistItem",
  async ({ animeId, updateData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateWatchlistItem(animeId, updateData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update watchlist item" }
      );
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  "watchlist/removeFromWatchlist",
  async (animeId, { rejectWithValue }) => {
    try {
      await userAPI.removeFromWatchlist(animeId);
      return animeId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to remove from watchlist" }
      );
    }
  }
);

export const fetchWatchHistory = createAsyncThunk(
  "watchlist/fetchWatchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getWatchHistory();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch watch history" }
      );
    }
  }
);

export const updateWatchHistory = createAsyncThunk(
  "watchlist/updateWatchHistory",
  async (historyData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateWatchHistory(historyData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update watch history" }
      );
    }
  }
);

// Watchlist slice
const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    clearWatchlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchlist = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch watchlist";
      })

      // Add to Watchlist
      .addCase(addToWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchlist = action.payload;
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add to watchlist";
      })

      // Update Watchlist Item
      .addCase(updateWatchlistItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWatchlistItem.fulfilled, (state, action) => {
        state.isLoading = false;

        // Find and update the item in the watchlist
        const updatedWatchlist = state.watchlist.map((item) =>
          item.animeId === action.payload.animeId ? action.payload : item
        );

        state.watchlist = updatedWatchlist;
      })
      .addCase(updateWatchlistItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to update watchlist item";
      })

      // Remove from Watchlist
      .addCase(removeFromWatchlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchlist = state.watchlist.filter(
          (item) => item.animeId !== action.payload
        );
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to remove from watchlist";
      })

      // Fetch Watch History
      .addCase(fetchWatchHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchHistory = action.payload;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch watch history";
      })

      // Update Watch History
      .addCase(updateWatchHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWatchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchHistory = action.payload;
      })
      .addCase(updateWatchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to update watch history";
      });
  },
});

export const { clearWatchlistError } = watchlistSlice.actions;

export default watchlistSlice.reducer;
