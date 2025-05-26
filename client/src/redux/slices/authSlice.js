import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent UI flashing during initial auth check
  error: null,
  authToken: null,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
  isTokenValid: false,
};

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      // Correct path to token and user data
      const token = response.data.data.token;
      const userData = response.data.data.data;

      // Save token to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      return { user: userData, token };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (data, { rejectWithValue }) => {
    try {
      // Handle both string email and object with email property
      const email = typeof data === "string" ? data : data.email;
      const response = await authAPI.resendVerification(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user data" }
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();

      // Remove token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      return null;
    } catch (error) {
      // Even if the API call fails, we want to log out the user on the client side
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      return rejectWithValue(
        error.response?.data || { message: "Error during logout" }
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const validateResetToken = createAsyncThunk(
  "auth/validateResetToken",
  async (resetToken, { rejectWithValue }) => {
    try {
      const response = await authAPI.validateResetToken(resetToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword({ resetToken, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setAuthToken: (state, action) => {
      state.authToken = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.authToken = null;
      state.error = null;

      // Remove token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForgotPasswordState: (state) => {
      state.forgotPasswordSuccess = false;
      state.error = null;
    },
    resetPasswordResetState: (state) => {
      state.resetPasswordSuccess = false;
      state.error = null;
    },
    resetTokenValidationState: (state) => {
      state.isTokenValid = false;
      state.error = null;
    },
    setNotLoading: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.authToken = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;

        // Store the specific error message
        state.error = action.payload?.message || "Login failed";

        // If error indicates pending verification, set a special flag
        // (however the redirect will be handled in the login component)
        if (
          state.error.includes("verify your email") ||
          state.error.includes("activate your account")
        ) {
          state.pendingVerification = true;
        }
      })

      // Email verification
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Email verification failed";
      })

      // Resend verification code
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        // Response may contain rate limiting info (attemptsLeft, nextResendAvailableIn)
        // This will be used by the UI components directly from the action payload
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to resend verification code";

        // Rate limiting errors should be handled by the UI components
        // with the appropriate error message from the action payload
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Failed to fetch user data";
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.authToken = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.authToken = null;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to process request";
        state.forgotPasswordSuccess = false;
      })

      // Validate Reset Token
      .addCase(validateResetToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isTokenValid = false;
      })
      .addCase(validateResetToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isTokenValid = true;
      })
      .addCase(validateResetToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Invalid or expired token";
        state.isTokenValid = false;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetPasswordSuccess = true;
        state.authToken = action.payload.data?.token;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Password reset failed";
        state.resetPasswordSuccess = false;
      });
  },
});

// Add a specific reducer for handling non-authenticated states
export const {
  setUser,
  setAuthToken,
  clearAuth,
  clearError,
  resetForgotPasswordState,
  resetPasswordResetState,
  resetTokenValidationState,
  setNotLoading,
} = authSlice.actions;

export default authSlice.reducer;
