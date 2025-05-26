import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  Button,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { TransitionGroup } from "react-transition-group";
import { useRouter } from "next/router";
import {
  setSearchQuery,
  addRecentSearch,
  clearRecentSearches,
  clearSuggestions,
} from "../../redux/slices/searchSlice";

const SearchPageBar = ({ onSearch }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const dispatch = useDispatch();

  const { searchQuery, recentSearches } = useSelector((state) => state.search);
  const [localQuery, setLocalQuery] = useState(searchQuery || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

  // Sync with URL query param on initial load
  useEffect(() => {
    const { q } = router.query;
    if (q && q !== localQuery) {
      setLocalQuery(q);
    }
  }, [router.query]);

  // Auto-search when user types 4 or more characters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery && localQuery.trim().length >= 4) {
        if (shouldAutoSearch) {
          // Get normalized versions of queries for comparison
          const normalizedCurrentQuery = localQuery.trim();
          const normalizedPreviousQuery = searchQuery ? searchQuery.trim() : "";

          // Only search if the query is different from the previous one
          if (normalizedCurrentQuery !== normalizedPreviousQuery) {
            dispatch(setSearchQuery(localQuery));
            dispatch(addRecentSearch(localQuery));
            setShowSuggestions(false);

            if (onSearch) {
              onSearch(localQuery);
            }
          }
          setShouldAutoSearch(false);
        }
      } else {
        dispatch(clearSuggestions());
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [localQuery, dispatch, shouldAutoSearch, onSearch, searchQuery]);
  const handleSearchChange = (e) => {
    setLocalQuery(e.target.value);
    if (e.target.value.trim().length >= 4) {
      setShouldAutoSearch(true);
    } else {
      setShowSuggestions(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // Get normalized versions of queries for comparison
      const normalizedCurrentQuery = localQuery.trim();
      const normalizedPreviousQuery = searchQuery ? searchQuery.trim() : "";

      // Only search if the query is different from the previous one
      if (normalizedCurrentQuery !== normalizedPreviousQuery) {
        dispatch(setSearchQuery(localQuery));
        dispatch(addRecentSearch(localQuery));
        setShowSuggestions(false);

        if (onSearch) {
          onSearch(localQuery);
        }
      }
    }
  };

  // Handle click outside to close suggestions
  const handleBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleRecentSearchClick = (query) => {
    setLocalQuery(query);

    // Only perform search if the query is different from the current search
    const normalizedClickedQuery = query.trim();
    const normalizedCurrentQuery = searchQuery ? searchQuery.trim() : "";

    if (normalizedClickedQuery !== normalizedCurrentQuery) {
      dispatch(setSearchQuery(query));
      setShowSuggestions(false);

      if (onSearch) {
        onSearch(query);
      }
    } else {
      // Just hide suggestions if it's the same query
      setShowSuggestions(false);
    }
  };

  const handleClearRecentSearches = () => {
    dispatch(clearRecentSearches());
  };

  const handleClearSearch = () => {
    setLocalQuery("");
    dispatch(clearSuggestions());
  };

  // Remove the handleSuggestionClick function as we won't have suggestions anymore

  return (
    // <Paper
    //   elevation={3}
    //   sx={{
    //     p: 2,
    //     position: "relative",
    //     bgcolor: "transparent",
    //     backdropFilter: "blur(8px)",
    //   }}
    // >

    // </Paper>
    <>
      <Box component="form" onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for anime..."
          value={localQuery}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {localQuery && (
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <Button
                  variant="contained"
                  onClick={handleSearchSubmit}
                  sx={{ ml: 1, display: isMobile ? "none" : "flex" }}
                >
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: `0 0 0 2px ${alpha(
                  theme.palette.primary.main,
                  0.25
                )}`,
              },
              "&.Mui-focused": {
                boxShadow: `0 0 0 2px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
              },
            },
          }}
        />

        {isMobile && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleSearchSubmit}
            sx={{ mt: 1 }}
          >
            Search
          </Button>
        )}
      </Box>

      {/* Only recent searches will be shown */}
      <Collapse
        in={showSuggestions && recentSearches.length > 0}
        timeout={300}
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 99,
          mt: 0.5,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            backdropFilter: "blur(5px)",
            background: (theme) => alpha(theme.palette.background.paper, 0.95),
          }}
        >
          {/* Recent searches section */}
          {recentSearches.length > 0 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Recent Searches</Typography>
                </Box>
                <Button size="small" onClick={handleClearRecentSearches}>
                  Clear
                </Button>
              </Box>

              <List dense disablePadding>
                <TransitionGroup>
                  {recentSearches.map((query) => (
                    <Collapse key={query}>
                      <ListItem
                        onClick={() => handleRecentSearchClick(query)}
                        sx={{
                          "&:hover": {
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.1),
                          },
                          cursor: "pointer",
                        }}
                      >
                        <SearchIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 2, opacity: 0.5 }}
                        />
                        <ListItemText primary={query} />
                      </ListItem>
                    </Collapse>
                  ))}
                </TransitionGroup>
              </List>
            </>
          )}
        </Paper>
      </Collapse>
    </>
  );
};

export default SearchPageBar;
