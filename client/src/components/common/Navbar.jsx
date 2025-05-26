import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  InputBase,
  useMediaQuery,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  Paper,
  Fade,
  ClickAwayListener,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { debounce } from "lodash";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  WbSunny as SeasonalIcon,
  ArrowBack as ArrowBackIcon,
  StarRounded,
} from "@mui/icons-material";
import { toggleTheme, toggleSidebar } from "../../redux/slices/uiSlice";
import { logoutUser } from "../../redux/slices/authSlice";
import {
  setSearchQuery,
  fetchSuggestions,
  clearSuggestions,
} from "../../redux/slices/searchSlice";

// Search Bar Component - Unified implementation for all screen sizes
const SearchBar = ({
  localSearchQuery,
  handleSearchChange,
  handleSearchSubmit,
  isFetchingSuggestions,
  suggestions,
  showSuggestions,
  handleSuggestionClick,
  handleClickAway,
  isSmallScreen = false,
  fullWidth = false,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: "relative", width: fullWidth ? "100%" : "auto" }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: "flex",
            flex: 1,
            position: "relative",
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(
              theme.palette.common.white,
              isFocused ? 0.2 : 0.15
            ),
            boxShadow: isFocused
              ? `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`
              : "none",
            "&:hover": {
              backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            ...(isSmallScreen ? { mx: 1 } : { mr: 2, ml: 0 }),
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isFocused
              ? isSmallScreen
                ? "scale(1.02)"
                : "scale(1.01)"
              : "scale(1)",
          }}
        >
          {!isSmallScreen && (
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: "100%",
                position: "absolute",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isFocused ? "primary.main" : "inherit",
                transition: "color 0.3s ease",
              }}
            >
              {isFetchingSuggestions ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SearchIcon />
              )}
            </Box>
          )}
          <InputBase
            id="search-input"
            placeholder="Search anime..."
            inputProps={{ "aria-label": "search" }}
            value={localSearchQuery}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            sx={{
              color: "inherit",
              flex: 1,
              "& .MuiInputBase-input": {
                padding: theme.spacing(1, 1, 1, 0),
                paddingLeft: isSmallScreen
                  ? theme.spacing(2)
                  : `calc(1em + ${theme.spacing(4)})`,
                width: "100%",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                ...(isSmallScreen
                  ? {}
                  : {
                      [theme.breakpoints.up("md")]: {
                        width: isFocused ? "30ch" : "20ch",
                      },
                    }),
              },
            }}
          />
          {isSmallScreen && (
            <IconButton
              type="submit"
              sx={{
                p: "10px",
                color: isFocused ? "primary.main" : "inherit",
                transition: "color 0.2s ease",
              }}
              aria-label="search"
            >
              {isFetchingSuggestions ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SearchIcon sx={{ mr: 1 }} />
              )}
            </IconButton>
          )}
        </Box>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Fade in={true} timeout={{ enter: 300, exit: 200 }}>
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                zIndex: 1000,
                mt: 0.5,
                width: isSmallScreen ? "100%" : { sm: 300, md: 450 },
                maxHeight: isSmallScreen ? 300 : 400,
                overflow: "hidden",
                borderRadius: 1,
                backdropFilter: "blur(10px)",
                background: (theme) =>
                  alpha(theme.palette.background.paper, 0.9),
                transform: "translateY(0)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: (theme) =>
                  `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
                animation: "slideDown 0.3s forwards",
                "@keyframes slideDown": {
                  from: {
                    opacity: 0,
                    transform: "translateY(-10px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
                "& *": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            >
              <Typography
                variant={isSmallScreen ? "caption" : "body2"}
                sx={{
                  display: "block",
                  px: 2,
                  pt: 1.5,
                  pb: 0.5,
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                Suggestions
              </Typography>
              <List sx={{ p: 0 }}>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={suggestion.animeId || suggestion.id}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                    component={suggestion.animeId ? "a" : undefined}
                    href={
                      suggestion.animeId
                        ? "/anime/" + suggestion.animeId
                        : undefined
                    }
                    sx={{
                      px: 2,
                      py: isSmallScreen ? 1 : 1.5,
                      transition: "all 0.2s",
                      textDecoration: "none",
                      color: "inherit",
                      animation: `fadeIn 0.3s ease forwards`,
                      animationDelay: `${index * 0.05}s`,
                      opacity: 0,
                      "@keyframes fadeIn": {
                        "0%": {
                          opacity: 0,
                          transform: "translateY(10px)",
                        },
                        "100%": {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      },
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: "translateX(5px)",
                      },
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        suggestion.imageSmall ||
                        suggestion.image ||
                        "/images/image_not_available.webp"
                      }
                      alt={suggestion.title}
                      sx={{
                        height: isSmallScreen ? 40 : 65,
                        width: isSmallScreen ? 30 : 50,
                        objectFit: "cover",
                        borderRadius: 0.5,
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography variant="body2" noWrap>
                        {suggestion.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {suggestion.score && (
                          <>
                            <StarRounded fontSize="small" color="warning" />
                            {suggestion.score} ·
                          </>
                        )}
                        {suggestion.type || "Unknown"} ·
                        {suggestion.episodes
                          ? ` ${suggestion.episodes} ${
                              suggestion.episodes === "1" ? "Ep" : "Eps"
                            }`
                          : " Unknown"}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Fade>
        )}
      </Box>
    </ClickAwayListener>
  );
};

const Navbar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isSearchPage = router.pathname === "/search";

  const {
    isAuthenticated,
    user,
    isLoading: authLoading,
  } = useSelector((state) => state.auth);
  const { themeMode } = useSelector((state) => state.ui);
  const { searchQuery, suggestions, isFetchingSuggestions } = useSelector(
    (state) => state.search
  );

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  // Create debounced search function that will only execute after delay
  const debouncedFetchSuggestions = useRef(
    debounce((query) => {
      if (query.length >= 4) {
        dispatch(fetchSuggestions(query));
        setShowSuggestions(true);
      } else {
        dispatch(clearSuggestions());
        setShowSuggestions(false);
      }
    }, 300)
  ).current;

  // Effect to clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  // Handle opening/closing user menu
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle mobile menu
  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    debouncedFetchSuggestions(query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      dispatch(setSearchQuery(localSearchQuery));
      dispatch(clearSuggestions());
      setShowSuggestions(false);
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(localSearchQuery.trim())}`);
      if (isMobile) {
        handleToggleMobileMenu();
      }
      if (isSmallScreen && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Navigate to the anime detail page when clicking a suggestion
    router.push(`/anime/${suggestion.id}`);
    setShowSuggestions(false);
    dispatch(clearSuggestions());
  };

  // Close suggestions on click away
  const handleClickAway = () => {
    setShowSuggestions(false);
  };

  // Handle mobile search expand/collapse with animation
  const toggleSearchExpand = () => {
    setIsSearchExpanded((prev) => !prev);
    // Reset search query when collapsing
    if (isSearchExpanded) {
      setLocalSearchQuery("");
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
    handleCloseUserMenu();
    handleToggleMobileMenu();
    router.push("/");
  };

  // Handle theme toggle
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    handleCloseUserMenu();
  };

  // Navigation items with icons
  const navItems = [
    { text: "Home", link: "/", icon: <HomeIcon /> },
    { text: "Seasonal", link: "/seasonal", icon: <SeasonalIcon /> },
    { text: "Schedule", link: "/schedule", icon: <CalendarIcon /> },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.2)" // Dark mode - semi-transparent dark color
            : "rgba(74, 74, 74, 0.3)", // Light mode - semi-transparent white color
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)", // For Safari support
        transition: "background 0.3s ease",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            minHeight: "70px", // Fixed height for consistency
            height: "70px",
          }}
        >
          {/* Logo and Brand */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isSmallScreen && isSearchExpanded ? (
              // Back button when search is expanded on small screens
              <IconButton
                color="primary"
                aria-label="back from search"
                edge="start"
                onClick={toggleSearchExpand}
                sx={{
                  mr: 2,
                  transition: "all 0.2s ease",
                  animation: "fadeIn 0.3s ease",
                  "@keyframes fadeIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateX(-10px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateX(0)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: "scale(1.1)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <>
                {/* Menu button (mobile only) */}
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleToggleMobileMenu}
                  sx={{ mr: 2, display: { md: "none" } }}
                >
                  <MenuIcon />
                </IconButton>

                {/* Brand logo */}
                <Fade in={!isSmallScreen || !isSearchExpanded}>
                  <Box
                    component="img"
                    src="/images/logo.png"
                    alt="Sugoi Logo"
                    sx={{
                      height: { xs: 52, sm: 62, md: 72 },
                      width: "auto",
                      display:
                        isSmallScreen && isSearchExpanded ? "none" : "block",
                    }}
                  />
                </Fade>
                <Fade in={!isSmallScreen || !isSearchExpanded}>
                  <Typography
                    variant="h6"
                    noWrap
                    component={Link}
                    href="/"
                    sx={{
                      mr: 2,
                      fontWeight: 700,
                      letterSpacing: "0.1rem",
                      color: "inherit",
                      textDecoration: "none",
                      display:
                        isSmallScreen && isSearchExpanded ? "none" : "flex",
                      alignItems: "center",
                      gap: 0,
                    }}
                  >
                    Sugoi
                  </Typography>
                </Fade>
              </>
            )}
            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  href={item.link}
                  disableRipple
                  sx={{
                    my: 2,
                    color: "white",
                    display: "block",
                    position: "relative",
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    "&:hover": {
                      backgroundColor: "transparent",
                      boxShadow: "none",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: router.pathname === item.link ? "100%" : "0",
                      height: "2px",
                      bottom: "0",
                      left: "0",
                      backgroundColor: "primary.light",
                      transition: "0.3s",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Search Box - Unified implementation using the SearchBar component */}
          {!isSearchPage && isSmallScreen ? (
            // Mobile Search: Either icon or expanded search bar
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                width: isSearchExpanded ? "100%" : "auto",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Animated search container */}
              <Fade in={isSearchExpanded} timeout={{ enter: 400, exit: 300 }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    opacity: isSearchExpanded ? 1 : 0,
                    visibility: isSearchExpanded ? "visible" : "hidden",
                    transform: isSearchExpanded
                      ? "translateX(0)"
                      : "translateX(20px)",
                    transition:
                      "opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease",
                    width: "100%",
                    zIndex: 10,
                  }}
                >
                  <SearchBar
                    localSearchQuery={localSearchQuery}
                    handleSearchChange={handleSearchChange}
                    handleSearchSubmit={handleSearchSubmit}
                    isFetchingSuggestions={isFetchingSuggestions}
                    suggestions={suggestions}
                    showSuggestions={showSuggestions}
                    handleSuggestionClick={handleSuggestionClick}
                    handleClickAway={handleClickAway}
                    isSmallScreen={true}
                    fullWidth={true}
                  />
                </Box>
              </Fade>

              {/* Search icon with animation */}
              <IconButton
                color="inherit"
                aria-label="search"
                onClick={toggleSearchExpand}
                sx={{
                  opacity: isSearchExpanded ? 0 : 1,
                  visibility: isSearchExpanded ? "hidden" : "visible",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                  transform: isSearchExpanded ? "scale(0.5)" : "scale(1)",
                  mr: -10,
                  animation: isSearchExpanded ? "none" : "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.2)" },
                    "70%": { boxShadow: "0 0 0 8px rgba(255, 255, 255, 0)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)" },
                  },
                }}
              >
                <SearchIcon sx={{ mr: 2 }} />
              </IconButton>
            </Box>
          ) : !isSearchPage ? (
            // Regular search box for larger screens with enhanced animations
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              <SearchBar
                localSearchQuery={localSearchQuery}
                handleSearchChange={handleSearchChange}
                handleSearchSubmit={handleSearchSubmit}
                isFetchingSuggestions={isFetchingSuggestions}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                handleSuggestionClick={handleSuggestionClick}
                handleClickAway={handleClickAway}
              />
            </Box>
          ) : null}

          {/* Right actions: Notifications, User Menu */}
          {authLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
              <CircularProgress size={24} color="inherit" />
            </Box>
          ) : (
            <Box
              sx={{
                display: isSmallScreen && isSearchExpanded ? "none" : "flex",
                alignItems: "center",
              }}
            >
              {/* Notification Icon */}
              {isAuthenticated && (
                <IconButton
                  size="large"
                  aria-label="show notifications"
                  color="inherit"
                  sx={{ ml: 1, display: { xs: "none", md: "block" } }}
                >
                  <NotificationsIcon />
                </IconButton>
              )}

              {/* Theme Toggle Button */}
              <IconButton
                size="large"
                aria-label="toggle theme"
                color="inherit"
                onClick={handleToggleTheme}
                sx={{ ml: 1, display: { xs: "none", md: "block" } }}
              >
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* User Menu */}
              {isAuthenticated ? (
                <Box sx={{ ml: 1 }}>
                  <Tooltip title="Open settings">
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{
                        p: 0,
                        ml: 1,
                        border: "2px solid",
                        borderColor: "primary.light",
                      }}
                    >
                      <Avatar
                        alt={user?.name || "User"}
                        src={user?.profileImage || "/images/placeholder.jpg"}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      onClick={handleCloseUserMenu}
                      component={Link}
                      href="/user/profile"
                    >
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseUserMenu}
                      component={Link}
                      href="/user/watchlist"
                    >
                      <ListItemIcon>
                        <BookmarkIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Watchlist</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseUserMenu}
                      component={Link}
                      href="/user/history"
                    >
                      <ListItemIcon>
                        <HistoryIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>History</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: "flex", ml: 1 }}>
                  <Button
                    color="inherit"
                    component={Link}
                    href="/auth/login"
                    variant="text"
                    sx={{
                      my: 2,
                      borderRadius: 3,
                      mx: { xs: 0, md: 1.5 },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="contained"
                    sx={{
                      my: 2,
                      mx: 0.5,
                      display: { xs: "none", sm: "block" },
                      borderRadius: 3,
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Menu Drawer - Only shown on mobile screens */}
          {isMobile && (
            <Drawer
              anchor="left"
              open={mobileMenuOpen}
              onClose={handleToggleMobileMenu}
              sx={{
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: 280,
                  background:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.95)
                      : alpha(theme.palette.background.paper, 0.98),
                  borderRight: `1px solid ${theme.palette.divider}`,
                },
                backdropFilter: "blur(8px)",
                display: { xs: "block", md: "none" },
              }}
            >
              <Box sx={{ width: "100%" }} role="presentation">
                {/* Drawer Header with Logo */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="img"
                      src="/images/logo.png"
                      alt="Sugoi Logo"
                      sx={{
                        height: 40,
                        width: "auto",
                        display: "block",
                        mr: 1,
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold" component="div">
                      Sugoi
                    </Typography>
                  </Box>
                  <IconButton onClick={handleToggleMobileMenu} color="primary">
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Navigation Items */}
                <List
                  sx={{
                    py: 1,
                  }}
                >
                  {navItems.map((item) => {
                    const isActive = router.pathname === item.link;
                    return (
                      <ListItem
                        button
                        key={item.text}
                        component={Link}
                        href={item.link}
                        onClick={handleToggleMobileMenu}
                        sx={{
                          py: 1.5,
                          borderLeft: isActive
                            ? `4px solid ${theme.palette.primary.main}`
                            : "4px solid transparent",
                          backgroundColor: isActive
                            ? alpha(theme.palette.primary.main, 0.1)
                            : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08
                            ),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? "primary.main" : "text.primary",
                            minWidth: "40px",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? "primary.main" : "text.primary",
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>

                {/* User Section */}
                {!isAuthenticated && (
                  <Box
                    sx={{
                      px: 2,
                      mt: 2,
                      display: "flex",
                      flexDirection: "row",
                      gap: 1.5,
                    }}
                  >
                    <Button
                      fullWidth
                      size="large"
                      variant="outlined"
                      component={Link}
                      href="/auth/login"
                      onClick={handleToggleMobileMenu}
                      sx={{ borderRadius: 2 }}
                    >
                      Login
                    </Button>
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      component={Link}
                      href="/auth/register"
                      onClick={handleToggleMobileMenu}
                      sx={{ borderRadius: 2 }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                )}

                {/* Theme Switch */}
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: "auto",
                  }}
                >
                  <Typography variant="body2">
                    {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
                  </Typography>
                  <IconButton onClick={handleToggleTheme} color="primary">
                    {themeMode === "dark" ? (
                      <LightModeIcon />
                    ) : (
                      <DarkModeIcon />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </Drawer>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
