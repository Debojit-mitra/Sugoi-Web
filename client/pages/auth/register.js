import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import Link from "next/link";
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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import {
  registerUser,
  clearError,
  verifyEmail,
  resendVerification,
} from "../../src/redux/slices/authSlice";
import Turnstile from "../../src/components/common/Turnstile";
import { showNotification } from "../../src/redux/slices/uiSlice";

// Form validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  // Multi-step form state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Account Details", "Verify Email"];

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");

  // For email verification step
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttemptsLeft, setResendAttemptsLeft] = useState(3);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Check for previous OTP resend attempts in localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && activeStep === 1) {
      // Check for stored cooldown info
      const storedEmail = localStorage.getItem("otpEmail");
      const storedCooldownEnd = localStorage.getItem("otpCooldownEnd");
      const storedAttemptsLeft = localStorage.getItem("otpAttemptsLeft");
      const storedRateLimitEnd = localStorage.getItem("otpRateLimitEnd");

      // If we have stored info for this email
      if (storedEmail === formData.email) {
        // Check if we're still in the rate limit window
        if (
          storedRateLimitEnd &&
          new Date(parseInt(storedRateLimitEnd)) > new Date()
        ) {
          // Set remaining attempts
          if (storedAttemptsLeft) {
            setResendAttemptsLeft(parseInt(storedAttemptsLeft));
          }
        }

        // Check if we're still in cooldown period
        if (storedCooldownEnd) {
          const cooldownEnd = new Date(parseInt(storedCooldownEnd));
          if (cooldownEnd > new Date()) {
            // Calculate remaining cooldown in seconds
            const remainingCooldown = Math.ceil(
              (cooldownEnd - new Date()) / 1000
            );
            setResendCooldown(remainingCooldown);

            // Set up countdown timer
            const countdownInterval = setInterval(() => {
              setResendCooldown((prevTime) => {
                if (prevTime <= 1) {
                  clearInterval(countdownInterval);
                  return 0;
                }
                return prevTime - 1;
              });
            }, 1000);

            // Clean up interval
            return () => clearInterval(countdownInterval);
          }
        }
      }
    }
  }, [activeStep, formData.email]);

  // Setup Turnstile
  useEffect(() => {
    // Global function to be called when Turnstile script loads
    window.onTurnstileLoaded = () => {
      //console.log("Turnstile script loaded successfully");
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

  // Check if user was redirected from login page to verify email
  useEffect(() => {
    const handleVerifyEmailRedirect = async () => {
      // Check for query parameter and stored email
      const pendingEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("pendingVerificationEmail")
          : null;

      if (router.query.verifyEmail === "true" && pendingEmail) {
        // Set form data with the stored email
        setFormData((prev) => ({
          ...prev,
          email: pendingEmail,
        }));

        // Go directly to verification step
        setActiveStep(1);
      }
    };

    if (router.isReady) {
      handleVerifyEmailRedirect();
    }
  }, [router.isReady, router.query]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === "agreeToTerms" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
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

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle verification code change
  const handleVerificationCodeChange = (e) => {
    const inputValue = e.target.value;
    // Allow only numbers and limit to 6 digits
    if (/^\d*$/.test(inputValue) && inputValue.length <= 6) {
      setVerificationCode(inputValue);
      setVerificationError("");
    }
  };

  // Validate account details form
  const validateAccountDetails = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
      isValid = false;
    }

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
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters long with uppercase, lowercase, and number";
      isValid = false;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
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

  // Handle next step button
  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate account details form
      if (validateAccountDetails()) {
        try {
          // Call registerUser action which will send the verification code
          const resultAction = await dispatch(
            registerUser({
              name: formData.name,
              email: formData.email,
              password: formData.password,
            })
          );

          if (registerUser.fulfilled.match(resultAction)) {
            // Move to verification step
            setActiveStep(1);

            dispatch(
              showNotification({
                message: "Verification code sent to your email",
                type: "success",
              })
            );
          }
        } catch (err) {
          // Error handling is done in the slice
        }
      }
    } else if (activeStep === 1) {
      // Handle email verification
      if (verificationCode.trim() === "") {
        setVerificationError("Please enter the verification code");
        return;
      }

      // Verify it's a 6-digit number
      if (!/^\d{6}$/.test(verificationCode)) {
        setVerificationError("Verification code must be 6 digits");
        return;
      }

      try {
        setVerificationError("");
        // Call the verifyEmail API with email and verification code
        const resultAction = await dispatch(
          verifyEmail({
            email: formData.email,
            otp: verificationCode,
          })
        );

        if (verifyEmail.fulfilled.match(resultAction)) {
          // Clear the pending verification email and OTP rate limiting data if they exist
          if (typeof window !== "undefined") {
            // Clear verification email
            if (localStorage.getItem("pendingVerificationEmail")) {
              localStorage.removeItem("pendingVerificationEmail");
            }

            // Clear OTP rate limiting data
            localStorage.removeItem("otpEmail");
            localStorage.removeItem("otpCooldownEnd");
            localStorage.removeItem("otpAttemptsLeft");
            localStorage.removeItem("otpRateLimitEnd");
          }

          dispatch(
            showNotification({
              message: router.query.verifyEmail
                ? "Email verified successfully! You can now login."
                : "Registration successful! You can now login.",
              type: "success",
            })
          );

          // Redirect to login page
          router.push("/auth/login");
        }
      } catch (err) {
        setVerificationError("Invalid verification code");
      }
    }
  };

  // Handle back button
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Account details form (Step 1)
  const renderAccountDetailsForm = () => (
    <Box>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
        error={!!formErrors.name}
        helperText={formErrors.name}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
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
        autoComplete="new-password"
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
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
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
                onClick={handleToggleConfirmPasswordVisibility}
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

      <Turnstile
        key="login-turnstile"
        onVerify={setTurnstileToken}
        action="login"
        theme={theme.palette.mode}
        id="login-turnstile-widget"
      />

      <FormControlLabel
        control={
          <Checkbox
            name="agreeToTerms"
            color="primary"
            checked={formData.agreeToTerms}
            onChange={handleChange}
          />
        }
        label={
          <Typography variant="body2">
            I agree to the{" "}
            <MuiLink href="#" underline="hover">
              Terms and Conditions
            </MuiLink>{" "}
            and{" "}
            <MuiLink href="#" underline="hover">
              Privacy Policy
            </MuiLink>
          </Typography>
        }
        sx={{ mt: 2 }}
      />

      {formErrors.agreeToTerms && (
        <Typography variant="caption" color="error">
          {formErrors.agreeToTerms}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        onClick={handleNext}
        disabled={isLoading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Next"}
      </Button>
    </Box>
  );

  // Function to handle resending the verification code
  const handleResendCode = async () => {
    if (isResending || resendCooldown > 0) return; // Prevent multiple clicks or during cooldown

    setIsResending(true);
    try {
      const resultAction = await dispatch(resendVerification(formData.email));

      if (resendVerification.fulfilled.match(resultAction)) {
        const { attemptsLeft, nextResendAvailableIn } = resultAction.payload
          .data || {
          attemptsLeft: 2, // Default if not provided by API
          nextResendAvailableIn: 60, // Default 60 seconds cooldown
        };

        // Update attempts left
        setResendAttemptsLeft(attemptsLeft);

        // Start cooldown timer
        setResendCooldown(nextResendAvailableIn);

        // Store cooldown and attempts info in localStorage
        if (typeof window !== "undefined") {
          const cooldownEnd = Date.now() + nextResendAvailableIn * 1000;
          const rateLimitEnd = Date.now() + 6 * 60 * 60 * 1000; // 6 hours

          localStorage.setItem("otpEmail", formData.email);
          localStorage.setItem("otpCooldownEnd", cooldownEnd.toString());
          localStorage.setItem("otpAttemptsLeft", attemptsLeft.toString());
          localStorage.setItem("otpRateLimitEnd", rateLimitEnd.toString());
        }

        // Set up countdown timer
        const countdownInterval = setInterval(() => {
          setResendCooldown((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(countdownInterval);
              // Clear cooldown from localStorage when it's done
              if (typeof window !== "undefined") {
                localStorage.removeItem("otpCooldownEnd");
              }
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);

        dispatch(
          showNotification({
            message: `Verification code resent to your email. You have ${attemptsLeft} ${
              attemptsLeft === 1 ? "attempt" : "attempts"
            } left.`,
            type: "success",
          })
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to resend verification code";

      // Check for rate limit error
      if (
        errorMessage.includes("wait") ||
        errorMessage.includes("limit reached")
      ) {
        // Extract time information if available
        const timeMatch = errorMessage.match(/(\d+)h\s(\d+)m/);
        let cooldownMessage = errorMessage;

        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          cooldownMessage = `Maximum attempts reached. Try again in ${hours}h ${minutes}m.`;
        }

        dispatch(
          showNotification({
            message: cooldownMessage,
            type: "warning",
          })
        );
      } else {
        dispatch(
          showNotification({
            message: errorMessage,
            type: "error",
          })
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  // Email verification form (Step 2)
  const renderVerificationForm = () => (
    <Box>
      <Typography variant="body1" paragraph>
        We&apos;ve sent a verification code to {formData.email}. Please check
        your inbox and enter the code below to complete your registration.
        <Typography variant="body2" color="secondary.main">
          (Check spam folder if you dont find it in your inbox.)
        </Typography>
      </Typography>

      <TextField
        margin="normal"
        required
        fullWidth
        id="verificationCode"
        label="Verification Code"
        name="verificationCode"
        autoFocus
        value={verificationCode}
        onChange={handleVerificationCodeChange}
        error={!!verificationError}
        helperText={
          verificationError || "Please enter 6-digit verification code"
        }
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          maxLength: 6,
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mx: { sm: 2, md: 0 }, my: { sm: 2, md: 0 }, py: 1.5, px: 3 }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={isLoading}
          sx={{ mx: { sm: 2, md: 0 }, my: { sm: 2, md: 0 }, py: 1.5, px: 3 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Complete Registration"
          )}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2">
          Didn&apos;t receive the code?{" "}
          {isResending ? (
            <CircularProgress
              size={16}
              color="primary"
              sx={{ ml: 1, verticalAlign: "middle" }}
            />
          ) : resendCooldown > 0 ? (
            <Typography component="span" variant="body2" color="text.secondary">
              Resend available in {resendCooldown} seconds
            </Typography>
          ) : (
            <Typography
              component="span"
              variant="body2"
              color="primary"
              sx={{
                cursor: "pointer",
                fontWeight: "medium",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={handleResendCode}
            >
              Resend Code
            </Typography>
          )}
        </Typography>

        {/* Display remaining attempts */}
        {resendAttemptsLeft < 3 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {resendAttemptsLeft}{" "}
            {resendAttemptsLeft === 1 ? "attempt" : "attempts"} remaining
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Head>
        <title>Register | Sugoi</title>
        <meta
          name="description"
          content="Create a new account on Sugoi to track and stream your favorite anime series and movies."
        />
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoaded"
          async
          defer
        ></script>
      </Head>

      <Container
        component="main"
        maxWidth="md"
        sx={{
          py: { xs: 15, sm: 12, md: 8 },
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
                minHeight: { sm: 600, md: 700 },
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
                  Join Sugoi
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ mb: 4, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
                >
                  Create your account to start your anime journey
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Right column with registration form */}
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
                  Join Sugoi
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Create your account to start your anime journey
                </Typography>
              </Box>
            )}

            {/* Registration stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Global error message */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => dispatch(clearError())}
              >
                {error}
              </Alert>
            )}

            {/* Active step form */}
            {activeStep === 0
              ? renderAccountDetailsForm()
              : renderVerificationForm()}

            {/* Alternative options */}
            {activeStep === 0 && (
              <>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2">
                    Already have an account?{" "}
                    <Link href="/auth/login" passHref legacyBehavior>
                      <MuiLink
                        variant="body2"
                        color="primary"
                        sx={{
                          fontWeight: "medium",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Sign In
                      </MuiLink>
                    </Link>
                  </Typography>
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Register;
