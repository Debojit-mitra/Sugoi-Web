import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // console.log("Token", localStorage.getItem("token"));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refreshing
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Special case for login errors - don't redirect
    if (
      originalRequest.url &&
      (originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/register"))
    ) {
      // Just pass through the error for login/registration - handled by components
      return Promise.reject(error);
    }

    // Handle token expiration for authenticated routes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only redirect to login if this isn't already a login request
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// API Endpoints

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  verifyEmail: (data) => api.post("/auth/verify-email", data),
  resendVerification: (email) =>
    api.post("/auth/resend-verification", { email }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  validateResetToken: (resetToken) =>
    api.get(`/auth/reset-password/${resetToken}/validate`),
  resetPassword: ({ resetToken, password }) =>
    api.put(`/auth/reset-password/${resetToken}`, { password }),
  getCurrentUser: () => api.get("/auth/getme"),
  updatePassword: (passwordData) =>
    api.put("/auth/update-password", passwordData),
  logout: () => api.get("/auth/logout"),
};

// User endpoints
export const userAPI = {
  updateProfile: (profileData) => api.put("/user/profile/update", profileData),
  deleteAccount: () => api.delete("/user/profile/delete"),
  getWatchlist: () => api.get("/user/watchlist"),
  addToWatchlist: (animeData) => api.post("/user/watchlist/add", animeData),
  updateWatchlistItem: (animeId, updateData) =>
    api.put(`/user/watchlist/${animeId}/update`, updateData),
  removeFromWatchlist: (animeId) =>
    api.delete(`/user/watchlist/${animeId}/delete`),
  getWatchHistory: () => api.get("/user/history"),
  updateWatchHistory: (historyData) =>
    api.post("/user/history/update", historyData),
  upgradeToPremium: () => api.post("/user/upgrade-premium"),
};

// Anime endpoints
export const animeAPI = {
  getTopAnime: (page = 1, limit = 20) =>
    api.get(`/anime/top?page=${page}&limit=${limit}`),
  getTopAiring: (page = 1, limit = 20) =>
    api.get(`/anime/top-airing?page=${page}&limit=${limit}`),
  getTopUpcoming: (page = 1, limit = 20) =>
    api.get(`/anime/top-upcoming?page=${page}&limit=${limit}`),
  getTopTV: (page = 1, limit = 20) =>
    api.get(`/anime/top-tv?page=${page}&limit=${limit}`),
  getTopMovies: (page = 1, limit = 20) =>
    api.get(`/anime/top-movies?page=${page}&limit=${limit}`),
  getTopOVA: (page = 1, limit = 20) =>
    api.get(`/anime/top-ova?page=${page}&limit=${limit}`),
  getTopONA: (page = 1, limit = 20) =>
    api.get(`/anime/top-ona?page=${page}&limit=${limit}`),
  getTopSpecial: (page = 1, limit = 20) =>
    api.get(`/anime/top-special?page=${page}&limit=${limit}`),
  getMostPopular: (page = 1, limit = 20) =>
    api.get(`/anime/most-popular?page=${page}&limit=${limit}`),
  getMostFavorited: (page = 1, limit = 20) =>
    api.get(`/anime/most-favorited?page=${page}&limit=${limit}`),
  getCurrentSeason: () => api.get("/anime/season"),
  getSeason: (year, season) => api.get(`/anime/season/${year}/${season}`),
  getSchedule: () => api.get("/anime/schedule"),
  searchAnime: (query, page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("page", page);
    params.append("limit", limit);

    // Add all available filters
    if (filters.type) params.append("type", filters.type);
    if (filters.score) params.append("score", filters.score);
    if (filters.status) params.append("status", filters.status);
    if (filters.demographic) params.append("demographic", filters.demographic);
    if (filters.adult !== undefined) params.append("adult", filters.adult);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    // Handle genres (can be multiple)
    if (filters.genre && filters.genre.length > 0) {
      params.append("genre", filters.genre.join(","));
    }

    return api.get(`/anime/search?${params.toString()}`);
  },
  getAnimeDetails: (id) => api.get(`/anime/${id}`),
};

export default api;
