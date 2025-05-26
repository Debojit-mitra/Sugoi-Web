import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import Turnstile from "../../src/components/common/Turnstile";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
} from "@mui/icons-material";
import {
  loginUser,
  clearError,
  resendVerification,
  forgotPassword,
  resetForgotPasswordState,
} from "../../src/redux/slices/authSlice";
import { showNotification } from "../../src/redux/slices/uiSlice";

// Form validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, isLoading, error, forgotPasswordSuccess } =
    useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");

  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordEmailError, setForgotPasswordEmailError] = useState("");

  // Handle forgot password dialog open/close
  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail(formData.email || "");
    setForgotPasswordEmailError("");
    dispatch(resetForgotPasswordState());
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    dispatch(resetForgotPasswordState());
  };

  // Handle forgot password email change
  const handleForgotPasswordEmailChange = (e) => {
    setForgotPasswordEmail(e.target.value);
    setForgotPasswordEmailError("");
  };

  // Handle forgot password submit
  const handleForgotPasswordSubmit = async () => {
    // Validate email
    if (!forgotPasswordEmail) {
      setForgotPasswordEmailError("Email is required");
      return;
    } else if (!validateEmail(forgotPasswordEmail)) {
      setForgotPasswordEmailError("Please enter a valid email address");
      return;
    }

    try {
      await dispatch(forgotPassword(forgotPasswordEmail));
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  // Close the dialog when password reset email is sent successfully
  useEffect(() => {
    if (forgotPasswordSuccess) {
      setTimeout(() => {
        handleForgotPasswordClose();
        dispatch(
          showNotification({
            message: "Password reset instructions sent to your email",
            type: "success",
          })
        );
      }, 1500);
    }
  }, [forgotPasswordSuccess, dispatch]);

  // Setup Turnstile
  useEffect(() => {
    // Global function to be called when Turnstile script loads
    window.onTurnstileLoaded = () => {
      console.log("Turnstile script loaded successfully");
    };

    // Add error handler for the script
    const turnstileScript = document.querySelector('script[src*="turnstile"]');
    if (turnstileScript) {
      turnstileScript.addEventListener("error", () => {
        console.error("Failed to load Turnstile script");
      });
    }

    return () => {
      delete window.onTurnstileLoaded;
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (forgotPasswordSuccess) {
      dispatch(
        showNotification({
          message: "Password reset email sent successfully.",
          type: "success",
        })
      );
      setForgotPasswordOpen(false);
      setForgotPasswordEmail("");
      dispatch(resetForgotPasswordState());
    }
  }, [forgotPasswordSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(resetForgotPasswordState());
    }
  }, [error, dispatch]);

  // Handle input change
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

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!turnstileToken) {
      dispatch(
        showNotification({
          message: "Please complete the CAPTCHA verification",
          type: "error",
        })
      );
      return;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Include the turnstile token with the login data
        const loginData = {
          ...formData,
          turnstileToken: turnstileToken,
        };
        const resultAction = await dispatch(loginUser(loginData));

        if (loginUser.fulfilled.match(resultAction)) {
          dispatch(
            showNotification({
              message: "Login successful! Welcome back.",
              type: "success",
            })
          );
          router.push("/");
        } else if (resultAction.error) {
          // Check if the error is related to email verification
          const errorMessage =
            resultAction.payload?.message || resultAction.error.message;

          if (
            errorMessage.includes("verify your email") ||
            errorMessage.includes("activate your account")
          ) {
            // Store the email in localStorage so it can be used in the verify email step
            if (typeof window !== "undefined") {
              localStorage.setItem("pendingVerificationEmail", formData.email);
            }

            try {
              // Attempt to resend the verification code
              const resendResult = await dispatch(
                resendVerification({ email: formData.email })
              );

              if (resendVerification.fulfilled.match(resendResult)) {
                // If successful, show message and store rate limiting data
                const { attemptsLeft, nextResendAvailableIn } = resendResult
                  .payload.data || {
                  attemptsLeft: 2,
                  nextResendAvailableIn: 60,
                };

                // Store rate limiting data in localStorage
                if (typeof window !== "undefined") {
                  const cooldownEnd = Date.now() + nextResendAvailableIn * 1000;
                  const rateLimitEnd = Date.now() + 6 * 60 * 60 * 1000; // 6 hours

                  localStorage.setItem("otpEmail", formData.email);
                  localStorage.setItem(
                    "otpCooldownEnd",
                    cooldownEnd.toString()
                  );
                  localStorage.setItem(
                    "otpAttemptsLeft",
                    attemptsLeft.toString()
                  );
                  localStorage.setItem(
                    "otpRateLimitEnd",
                    rateLimitEnd.toString()
                  );
                }

                dispatch(
                  showNotification({
                    message: "We've sent a new verification code to your email",
                    type: "info",
                  })
                );
              }
            } catch (resendError) {
              // If rate limited, still redirect to verification page but don't resend
              // The register page will show the appropriate message
              const errorMessage =
                resendError.response?.data?.message ||
                "Couldn't send verification code. You may need to wait before requesting another one.";

              dispatch(
                showNotification({
                  message: errorMessage,
                  type: "warning",
                })
              );
            }

            // Redirect to the registration page's verification step
            router.push({
              pathname: "/auth/register",
              query: { verifyEmail: "true" },
            });
          } else if (errorMessage.includes("Email not registered")) {
            // Handle unregistered email
            setFormErrors({
              email: "This email is not registered",
              password: "",
            });
            dispatch(clearError());
          } else if (errorMessage.includes("Incorrect password")) {
            // Handle incorrect password
            setFormErrors({
              email: "",
              password: "Incorrect password",
            });
            dispatch(clearError());
          } else {
            // For other errors, just keep the error in the global state
            // The error will be displayed in the Alert component
          }
        }
      } catch (err) {
        console.error("Login error:", err);
        // Other errors are handled in the slice
      }
    }
  };

  return (
    <>
      <Head>
        <title>Login | Sugoi</title>
        <meta
          name="description"
          content="Login to your Sugoi account to track your favorite anime series and movies."
        />
        <script
          id="turnstile-script"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoaded"
          async
          defer
        ></script>
      </Head>

      <Container
        component="main"
        maxWidth="md"
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Grid
          container
          sx={{
            justifyContent: "center",
            boxShadow: { xs: "none", sm: theme.shadows[10] },
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Left column with illustration/background for larger screens */}
          {!isMobile && (
            <Grid
              size={{ sm: 5, md: 6 }}
              sx={{
                display: { xs: "none", sm: "block" },
                position: "relative",
                overflow: "hidden",
                minHeight: { sm: 500, md: 600 },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: "url(/images/login_2.webp)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.8,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(13, 0, 28, 0.2)"
                      : "rgba(13, 0, 28, 0.5)", //tint
                  color: "white",
                  p: 2,
                  zIndex: 2,
                }}
              >
                <Typography
                  component="h1"
                  variant="h1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
                >
                  Welcome Back!
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ mb: 4, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
                >
                  Log in to continue your anime journey
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Right column with login form */}
          <Grid
            size={{ xs: 12, sm: 7, md: 6 }}
            component={Paper}
            elevation={0}
            square
            sx={{
              p: { xs: 2, sm: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: (theme) =>
                theme.palette.mode === "light"
                  ? "rgba(255, 255, 255, 0.4)" // light tint
                  : "rgba(30, 30, 30, 0.92)", // dark tint
            }}
          >
            {/* Mobile only title */}
            {isMobile && (
              <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography component="h1" variant="h4" fontWeight="bold">
                  Welcome Back!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Log in to continue your anime journey
                </Typography>
              </Box>
            )}

            {/* Show authentication errors from Redux in an alert */}
            {error &&
              error !== "Email not registered" &&
              error !== "Incorrect password" && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                  onClose={() => dispatch(clearError())}
                >
                  {error}
                </Alert>
              )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
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
                        onClick={handleTogglePasswordVisibility}
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
              <Box sx={{ textAlign: "right", mb: 2 }}>
                <MuiLink
                  onClick={handleForgotPasswordOpen}
                  variant="body2"
                  underline="hover"
                  sx={{ cursor: "pointer" }}
                >
                  Forgot password?
                </MuiLink>
              </Box>

              <Turnstile
                key="login-turnstile"
                onVerify={setTurnstileToken}
                action="login"
                theme={theme.palette.mode}
                id="login-turnstile-widget"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="body2">
                  Don&apos;t have an account?{" "}
                  <MuiLink
                    href="/auth/register"
                    variant="body2"
                    fontWeight="medium"
                    underline="hover"
                  >
                    Sign Up
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "500px",
            p: 1,
          },
        }}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your email address and we&apos;ll send you instructions to
            reset your password.
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Email sent successfully! Please check your inbox.
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="forgot-email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotPasswordEmail}
            onChange={handleForgotPasswordEmailChange}
            error={!!forgotPasswordEmailError}
            helperText={forgotPasswordEmailError}
            disabled={isLoading || forgotPasswordSuccess}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleForgotPasswordClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleForgotPasswordSubmit}
            variant="contained"
            disabled={isLoading || forgotPasswordSuccess}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;
