import React, { useEffect } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import getTheme from "../../../styles/theme";
import Navbar from "./Navbar";
//import Sidebar from "./Sidebar";
import Footer from "./Footer";
import GoToTop from "./GoToTop";
import { setThemeMode, hideNotification } from "../../redux/slices/uiSlice";
import { getCurrentUser, setNotLoading } from "../../redux/slices/authSlice";

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { themeMode, sidebarOpen, notification } = useSelector(
    (state) => state.ui
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Initialize theme from localStorage (if available)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("themeMode");
      if (savedTheme) {
        dispatch(setThemeMode(savedTheme));
      }
    }
  }, [dispatch]);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token && !isAuthenticated) {
          try {
            await dispatch(getCurrentUser()).unwrap();
          } catch (error) {
            // If token is invalid, clear it
            localStorage.removeItem("token");
            console.error("Authentication failed:", error);
          }
        } else if (!token) {
          // If there's no token, set isLoading to false
          dispatch(setNotLoading());
        }
      }
    };

    checkAuth();
  }, [dispatch, isAuthenticated]);

  // Create theme based on themeMode
  const theme = getTheme(themeMode);

  // Handle notification close
  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(hideNotification());
  };

  // Determine if we should show the sidebar (not on auth pages)
  const isAuthPage = router.pathname.startsWith("/auth/");
  const isLoginPage = router.pathname === "/auth/login";
  const isRegisterPage = router.pathname === "/auth/register";
  const isResetPasswordPage = router.pathname.startsWith(
    "/auth/reset-password/"
  );
  const is404Page = router.pathname === "/404";
  const showBackgroundImage =
    isLoginPage || isRegisterPage || isResetPasswordPage || is404Page;
  const showSidebar = !isAuthPage;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />
        <Box sx={{ display: "flex", flexGrow: 1, mt: -9 }}>
          {/* {showSidebar && <Sidebar />} */}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              transition: (theme) =>
                theme.transitions.create(["width", "margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              position: "relative",
              //pb: 8, // Extra padding at bottom to accommodate footer
              overflow: "hidden", // Prevents the blurred image from overflowing
              ...(!showBackgroundImage && {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? theme.palette.common.white
                    : theme.palette.common.black,
              }),
              ...(showBackgroundImage && {
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: "url(/images/login.webp)",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  filter: "blur(10px) saturate(0.9)",
                  transform: "scale(1.1)", // To avoid white edges due to blur
                  zIndex: -1,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.4)",
                  zIndex: -1,
                },
              }),
            }}
          >
            {children}
          </Box>
        </Box>
        <Footer />
        {/* Go to Top Button */}
        <GoToTop threshold={200} position={{ right: 25, bottom: 25 }} />
        {/* Global Notification */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleNotificationClose}
            severity={notification.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
