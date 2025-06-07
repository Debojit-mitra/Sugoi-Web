import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  useTheme,
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
  resetPassword,
  validateResetToken,
  clearError,
  resetPasswordResetState,
  resetTokenValidationState,
} from "../../../src/redux/slices/authSlice";
import { showNotification } from "../../../src/redux/slices/uiSlice";

const ResetPassword = () => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = router.query;

  const {
    isLoading,
    error,
    resetPasswordSuccess,
    isAuthenticated,
    isTokenValid,
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If already authenticated or password reset successful, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Redirect to login page after successful password reset
  useEffect(() => {
    if (resetPasswordSuccess) {
      dispatch(
        showNotification({
          message:
            "Your password has been reset successfully. Please login with your new password.",
          type: "success",
        })
      );

      setTimeout(() => {
        router.push("/auth/login");
        dispatch(resetPasswordResetState());
      }, 1500);
    }
  }, [resetPasswordSuccess, dispatch, router]);

  // Reset error state when component mounts and unmounts
  useEffect(() => {
    // Clear any existing errors when component mounts
    if (error) {
      dispatch(clearError());
    }

    // Clear errors and reset states when component unmounts
    return () => {
      dispatch(clearError());
      dispatch(resetTokenValidationState());
    };
  }, [dispatch, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }

    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: "", confirmPassword: "" };

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make sure we have a valid token
    if (!isTokenValid) {
      dispatch(
        showNotification({
          message: "Invalid or expired reset token",
          type: "error",
        })
      );
      return;
    }

    if (validateForm()) {
      try {
        //console.log("Submitting with token:", router.query.token);
        await dispatch(
          resetPassword({
            resetToken: router.query.token,
            password: formData.password,
          })
        );
      } catch (err) {
        console.error("Reset password error:", err);
      }
    }
  };

  // Add state to track if we're waiting for the token
  const [isTokenLoading, setIsTokenLoading] = useState(true);

  // Handle token from URL and validate it
  useEffect(() => {
    // Router query is ready
    if (router.isReady) {
      const urlToken = router.query.token;
      //console.log("Token from URL:", urlToken);

      if (urlToken) {
        // Validate the token
        dispatch(validateResetToken(urlToken)).finally(() => {
          setIsTokenLoading(false);
        });
      } else {
        setIsTokenLoading(false);
      }
    }
  }, [router.isReady, router.query, dispatch]);

  // If token is not available yet (during initial load)
  if (isTokenLoading) {
    return (
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          py: 8,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading reset token...</Typography>
        </Box>
      </Container>
    );
  }

  // If token is invalid or expired
  if ((!router.query.token || !isTokenValid) && !isTokenLoading) {
    return (
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          py: 8,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 3,
            width: "100%",
            textAlign: "center",
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(0, 0, 0, 0.5)",
            boxShadow: theme.shadows[6],
            backdropFilter: "blur(20px)",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Invalid Reset Link
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {error || "The password reset link is invalid or has expired."}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please request a new password reset link.
          </Typography>
          <Button
            variant="contained"
            component={MuiLink}
            href="/auth/login"
            sx={{ textDecoration: "none" }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password | Sugoi</title>
        <meta
          name="description"
          content="Reset your password to access your Sugoi account"
        />
      </Head>

      <Container
        component="main"
        maxWidth="sm"
        sx={{
          py: 8,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            width: "100%",
            borderRadius: 2,
            boxShadow: theme.shadows[6],
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.4)"
                : "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              component="h1"
              variant="h4"
              fontWeight="bold"
              gutterBottom
            >
              Reset Your Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {resetPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset successful! Redirecting to login...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading || resetPasswordSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={isLoading || resetPasswordSuccess}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading || resetPasswordSuccess}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <MuiLink href="/auth/login" variant="body2" underline="hover">
                Back to Login
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ResetPassword;
