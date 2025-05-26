import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Chip,
  Grid,
  useMediaQuery,
  useTheme,
  Fade,
  Paper,
} from "@mui/material";

import Layout from "../src/components/common/Layout";
import SeasonalAnimeGrid from "../src/components/anime/SeasonalAnimeGrid";
import SkeletonAnimeGrid from "../src/components/anime/SkeletonAnimeGrid";
import SearchPageBar from "../src/components/search/SearchPageBar";
import SearchFilters from "../src/components/search/SearchFilters";
import {
  searchAnime,
  resetSearchPagination,
  clearSuggestions,
} from "../src/redux/slices/searchSlice";

const SearchResultsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { q } = router.query;
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef(null);

  const {
    searchResults,
    isLoading,
    error,
    pagination,
    searchQuery,
    activeFilters,
  } = useSelector((state) => state.search);

  // Function to handle search
  const handleSearch = (query) => {
    // Update URL with the search query
    router.push(
      {
        pathname: "/search",
        query: { q: query },
      },
      undefined,
      { shallow: true }
    );

    // Reset pagination and fetch results
    setCurrentPage(1);
    dispatch(resetSearchPagination());
    dispatch(
      searchAnime({
        query,
        page: 1,
        limit: 20,
        filters: activeFilters,
      })
    );
  };

  // Function to handle filter application
  const handleApplyFilters = () => {
    if (!q && !searchQuery) return;

    setCurrentPage(1);
    dispatch(resetSearchPagination());
    dispatch(
      searchAnime({
        query: q || searchQuery,
        page: 1,
        limit: 20,
        filters: activeFilters,
      })
    );
  };

  // Function to handle filter reset
  const handleResetFilters = () => {
    if (!q && !searchQuery) return;

    setCurrentPage(1);
    dispatch(resetSearchPagination());
    dispatch(
      searchAnime({
        query: q || searchQuery,
        page: 1,
        limit: 20,
        filters: {},
      })
    );
  };

  // Function to load more results
  const loadMoreResults = useCallback(() => {
    if ((!q && !searchQuery) || isLoading || isLoadingMore) return;

    // Don't load more if we've reached the last page
    if (currentPage >= pagination?.totalPages) return;

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);

    dispatch(
      searchAnime({
        query: q || searchQuery,
        page: nextPage,
        limit: 20,
        filters: activeFilters,
      })
    ).finally(() => {
      setCurrentPage(nextPage);
      setIsLoadingMore(false);
    });
  }, [
    q,
    searchQuery,
    currentPage,
    pagination,
    isLoading,
    isLoadingMore,
    dispatch,
    activeFilters,
  ]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreResults();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, loadMoreResults]);

  // Fetch initial search results when query changes
  useEffect(() => {
    if (q) {
      setCurrentPage(1);
      dispatch(resetSearchPagination());
      dispatch(clearSuggestions()); // Clear any suggestions
      dispatch(
        searchAnime({
          query: q,
          page: 1,
          limit: 20,
          filters: activeFilters,
        })
      );
    }
  }, [dispatch, q]);

  return (
    <>
      <Head>
        <title>{q ? `Search: ${q} | Sugoi Web` : `Search | Sugoi Web`}</title>
        <meta name="description" content={`Anime search results for ${q}`} />
      </Head>

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "70vh", // only 30% of the viewport height
          zIndex: 0,
          overflow: "hidden", // prevent overflow
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? `linear-gradient(0deg,
              ${theme.palette.common.black} 0%,
              rgb(0, 0, 0) 10%,
              rgba(0,0,0,0.7) 25%,
              rgba(0,0,0,0.55) 40%,
              rgba(0,0,0,0.4) 55%,
              rgba(0,0,0,0.25) 70%,
              rgba(0,0,0,0.15) 85%,
              rgba(0,0,0,0.05) 100%)`
                : `linear-gradient(0deg,
              ${theme.palette.common.white} 0%,
              rgba(245,245,245,0.65) 10%,
              rgba(245,245,245,0.5) 25%,
              rgba(245,245,245,0.4) 40%,
              rgba(245,245,245,0.3) 55%,
              rgba(245,245,245,0.2) 70%,
              rgba(245,245,245,0.1) 85%,
              rgba(245,245,245,0.05) 100%)`,
            zIndex: 1,
          },
        }}
      >
        <Box
          component="img"
          src="/images/login.webp"
          alt={"a"}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(8px)",
            transform: "scale(1.1)",
            transition: "transform 0.5s ease",
          }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 10 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
          sx={{ mt: 8, mb: 3 }}
        >
          Search Anime
        </Typography>

        <Grid container spacing={3} direction={"column"}>
          {/* Search and Filter Column */}
          <Grid size={{ xs: 12 }}>
            <Fade in={true} timeout={500}>
              <Box sx={{ position: "sticky", top: 90 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    position: "relative",
                    bgcolor: "transparent",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <SearchPageBar onSearch={handleSearch} />
                  <SearchFilters
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                  />
                </Paper>
              </Box>
            </Fade>
          </Grid>

          {/* Results Column */}
          <Grid size={{ xs: 12 }}>
            {/* Query summary and result count */}
            {q && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Search results for:
                </Typography>
                <Chip
                  label={q}
                  color="primary"
                  variant="outlined"
                  size="medium"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: "auto" }}
                >
                  {pagination?.totalResults && pagination?.totalResults
                    ? `${
                        pagination.totalResults * pagination.totalPages
                      } results found`
                    : ""}
                </Typography>
              </Box>
            )}

            {isLoading && currentPage === 1 ? (
              <Box sx={{ py: 2 }}>
                <SkeletonAnimeGrid count={12} />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography variant="h6" color="error">
                  {error}
                </Typography>
              </Box>
            ) : searchResults.length > 0 ? (
              <>
                <SeasonalAnimeGrid animeList={searchResults} />

                {/* Infinite scroll loader */}
                <Box
                  ref={loaderRef}
                  sx={{
                    py: 4,
                    textAlign: "center",
                    display:
                      currentPage < pagination?.totalPages ? "block" : "none",
                  }}
                >
                  {isLoadingMore && (
                    <CircularProgress size={32} color="primary" />
                  )}
                </Box>

                {/* End of results message */}
                {currentPage >= pagination?.totalPages &&
                  searchResults.length > 0 && (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="body1" color="text.secondary">
                        You&apos;ve reached the end of search results
                      </Typography>
                    </Box>
                  )}
              </>
            ) : (
              <Box sx={{ mt: 4, textAlign: "center", py: 10 }}>
                <Typography variant="h6" color="text.secondary">
                  {q
                    ? `No results found for "${q}"`
                    : "Enter a search query to see results"}
                </Typography>
                {q && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Try adjusting your search filters or using different
                    keywords
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default SearchResultsPage;
