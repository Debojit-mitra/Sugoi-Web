import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import animeReducer from "./slices/animeSlice";
import watchlistReducer from "./slices/watchlistSlice";
import uiReducer from "./slices/uiSlice";
import searchReducer from "./slices/searchSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    anime: animeReducer,
    watchlist: watchlistReducer,
    ui: uiReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
