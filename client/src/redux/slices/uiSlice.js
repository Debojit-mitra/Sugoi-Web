import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  themeMode: "light",
  sidebarOpen: false,
  isLoading: false,
  notification: {
    open: false,
    message: "",
    type: "info", // 'success', 'error', 'info', 'warning'
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === "light" ? "dark" : "light";
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("themeMode", state.themeMode);
      }
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("themeMode", action.payload);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    showNotification: (state, action) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        type: action.payload.type || "info",
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
  },
});

export const {
  toggleTheme,
  setThemeMode,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  showNotification,
  hideNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
