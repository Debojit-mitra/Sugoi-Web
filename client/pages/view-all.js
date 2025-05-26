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
import {
  fetchAllAnimeByCategory,
  resetViewAllPagination,
} from "../src/redux/slices/animeSlice";
import TrendingSection from "@/src/components/home/TrendingSection";

const ViewAllPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { category } = router.query;
  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef(null);

  const {
    viewAllAnime,
    isLoading,
    isPaginationLoading,
    error,
    viewAllPagination,
  } = useSelector((state) => state.anime);

  // Get category title
  const getCategoryTitle = () => {
    switch (category) {
      case "airing":
        return "Currently Airing Anime";
      case "upcoming":
        return "Upcoming Anime";
      case "popular":
        return "Most Popular Anime";
      case "top-rated":
        return "Top Rated Anime";
      case "movies":
        return "Top Anime Movies";
      default:
        return "Anime";
    }
  };

  // Function to load more results
  const loadMoreResults = useCallback(() => {
    if (!category || isLoading || isPaginationLoading) return;

    // Don't load more if we've reached the last page
    if (currentPage >= viewAllPagination?.totalPages) return;

    const nextPage = currentPage + 1;

    dispatch(
      fetchAllAnimeByCategory({
        category,
        page: nextPage,
        limit: 24,
      })
    )
      .unwrap()
      .then(() => {
        setCurrentPage(nextPage);
      })
      .catch((error) => {
        // If we get a 404 error, treat it as "end of list" instead of showing error
        const errorMessage = error?.message || error?.toString() || "";
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("not found")
        ) {
          // Mark as end of list by setting current page to match totalPages
          setCurrentPage(viewAllPagination?.totalPages || currentPage);
        }
      });
  }, [
    category,
    currentPage,
    viewAllPagination,
    isLoading,
    isPaginationLoading,
    dispatch,
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
  }, [loadMoreResults]);

  // Initial fetch when category changes
  useEffect(() => {
    if (category) {
      setCurrentPage(1);
      dispatch(resetViewAllPagination());
      dispatch(fetchAllAnimeByCategory({ category, page: 1, limit: 24 }));
    }
  }, [category, dispatch]);

  return (
    <>
      <Head>
        <title>{getCategoryTitle()} | Sugoi Anime</title>
        <meta
          name="description"
          content={`Browse all ${getCategoryTitle().toLowerCase()}`}
        />
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

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 2 }}>
        <Box mb={4} mt={8}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            {getCategoryTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse the complete collection
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ ml: "auto", textAlign: { xs: "start", md: "end" } }}
          >
            {viewAllPagination?.totalResults && viewAllPagination?.totalResults
              ? `${
                  viewAllPagination.totalResults * viewAllPagination.totalPages
                } results found`
              : ""}
          </Typography>
        </Box>

        {/* Handle loading and data display with better conditions */}
        {isLoading && currentPage === 1 ? (
          <SkeletonAnimeGrid count={24} />
        ) : error &&
          !String(error).includes("404") &&
          !String(error).includes("not found") ? (
          <Paper
            elevation={0}
            sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2 }}
          >
            <Typography color="error">
              Error: {error}. Please try again later.
            </Typography>
          </Paper>
        ) : viewAllAnime.length > 0 ? (
          <Box>
            <TrendingSection animeList={viewAllAnime} />

            {/* Loading indicator at the bottom */}
            {isPaginationLoading && (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Invisible element for intersection observer */}
            <Box ref={loaderRef} height="20px" />

            {/* End of results indicator */}
            {(currentPage >= viewAllPagination?.totalPages ||
              (error &&
                (String(error).includes("404") ||
                  String(error).includes("not found")))) &&
              viewAllAnime.length > 0 && (
                <Box textAlign="center" my={4}>
                  <Typography variant="body1" color="text.secondary">
                    You&apos;ve reached the end of the list
                  </Typography>
                </Box>
              )}
          </Box>
        ) : !isLoading ? (
          <Paper
            elevation={0}
            sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2 }}
          >
            <Typography>No anime found for this category.</Typography>
          </Paper>
        ) : (
          <SkeletonAnimeGrid count={24} />
        )}
      </Container>
    </>
  );
};

export default ViewAllPage;
