import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { Icon } from "@iconify-icon/react";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  MilitaryTech as MilitaryTechIcon,
  TrendingUp as TrendingUpIcon,
  SettingsInputAntennaRounded as SettingsInputAntennaRoundedIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
  fetchTopAnime,
  fetchTopAiring,
  fetchMostPopular,
  fetchMostFavorited,
  fetchCurrentSeason,
  fetchTopMovies,
  fetchSeason,
} from "../src/redux/slices/animeSlice";
import FeaturedAnimeSection from "../src/components/home/FeaturedAnimeSection";
import TrendingSection from "../src/components/home/TrendingSection";
import SeasonalSection from "../src/components/home/SeasonalSection";

export default function Home() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { isAuthenticated } = useSelector((state) => state.auth);

  const {
    topAnime,
    topAiring,
    mostPopular,
    topMovies,
    currentSeason,
    mostFavorited,
    isLoading,
    error,
  } = useSelector((state) => state.anime);

  useEffect(() => {
    // Fetch data for the home page
    dispatch(fetchTopAnime({ limit: 10 }));
    dispatch(fetchTopAiring({ limit: 10 }));
    dispatch(fetchMostPopular({ limit: 10 }));
    dispatch(fetchTopMovies({ limit: 10 }));
    dispatch(fetchTopMovies({ limit: 10 }));
    dispatch(fetchMostFavorited({ limit: 10 }));
    dispatch(fetchCurrentSeason());
    dispatch(fetchSeason({ year: 2024, season: "spring" }));
  }, [dispatch]);

  // Get featured anime (basically top 10 airing TV(new) & top 5 airing Tv(Continuing) & Top 3 Movie)
  const featuredAnime = [
    ...(currentSeason?.["TV (New)"]?.slice(0, 10) || []),
    ...(currentSeason?.["TV (Continuing)"]?.slice(0, 5) || []),
    ...(currentSeason?.["Movie"]?.slice(0, 3) || []),
  ];

  // Get the currently airing anime
  const airingAnime = topAiring.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  // Get the top-rated anime
  const topRatedAnime = topAnime.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  const topRatedMovies = topMovies.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  // get the popuplar anime
  const popularAnime = mostPopular.slice(0, isMobile ? 6 : isTablet ? 8 : 12);

  const mostFavoritedAnime = mostFavorited.slice(
    0,
    isMobile ? 6 : isTablet ? 8 : 12
  );

  return (
    <>
      <Head>
        <title>SUGOI - Your Ultimate Anime Streaming Platform</title>
        <meta
          name="description"
          content="Stream and track your favorite anime series and movies with Sugoi, the best anime streaming platform."
        />
      </Head>

      <Box>
        {/* Feature Anime Section (Randomly picked currently airing anime) */}
        <FeaturedAnimeSection
          featuredAnime={featuredAnime}
          isLoading={isLoading}
          sx={{ maxWidth: 100 }}
        />
        {/* Airing Section */}
        <Container
          maxWidth="xl"
          sx={{
            py: { xs: 3, sm: 3, md: 4, lg: 5 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SettingsInputAntennaRoundedIcon
                color="success"
                sx={{ mr: 1, fontSize: "1.6rem" }}
              />
              <Typography
                variant="h3"
                component="h2"
                fontWeight="bold"
                fontSize={{
                  xs: "1.2rem",
                  sm: "1.4rem",
                  md: "1.6rem",
                  lg: "2rem",
                }}
              >
                Currently Airing
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/view-all?category=airing"
              endIcon={<ArrowForwardIcon />}
              color="primary"
            >
              View All
            </Button>
          </Box>

          <TrendingSection animeList={airingAnime} isLoading={isLoading} />
        </Container>
        {/* Top Rated Section */}
        <Box
          sx={{
            //mt: { xs: 3, sm: 3, md: 4, lg: 5 },
            py: { xs: 3, sm: 3, md: 4, lg: 5 },
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.background.alternate,
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MilitaryTechIcon
                  color="error"
                  sx={{ mr: 1, fontSize: "2rem" }}
                />
                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="bold"
                  fontSize={{
                    xs: "1.2rem",
                    sm: "1.4rem",
                    md: "1.6rem",
                    lg: "2rem",
                  }}
                >
                  Top Rated
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/view-all?category=top-rated"
                endIcon={<ArrowForwardIcon />}
                color="primary"
              >
                View All
              </Button>
            </Box>

            <TrendingSection animeList={topRatedAnime} isLoading={isLoading} />
          </Container>
        </Box>
        {/* Most Popular Section */}
        <Box
          sx={{
            mt: { xs: 3, sm: 3, md: 4, lg: 5 },
            py: { xs: 3, sm: 3, md: 4, lg: 5 },
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon
                  color="warning"
                  sx={{ mr: 1, fontSize: "2rem" }}
                />
                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="bold"
                  fontSize={{
                    xs: "1.2rem",
                    sm: "1.4rem",
                    md: "1.6rem",
                    lg: "2rem",
                  }}
                >
                  Most Popular
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/view-all?category=popular"
                endIcon={<ArrowForwardIcon />}
                color="primary"
              >
                View All
              </Button>
            </Box>

            <TrendingSection
              animeList={popularAnime}
              isLoading={isLoading}
              showRank
            />
          </Container>
        </Box>
        {/* Top Rated Movies Section */}
        <Box
          sx={{
            //mt: { xs: 3, sm: 3, md: 4, lg: 5 },
            py: { xs: 3, sm: 3, md: 4, lg: 5 },
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.background.alternate,
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MilitaryTechIcon
                  color="warning"
                  sx={{ mr: 1, fontSize: "2rem" }}
                />
                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="bold"
                  fontSize={{
                    xs: "1.2rem",
                    sm: "1.4rem",
                    md: "1.6rem",
                    lg: "2rem",
                  }}
                >
                  Top Rated Movies
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/view-all?category=movies"
                endIcon={<ArrowForwardIcon />}
                color="primary"
              >
                View All
              </Button>
            </Box>

            <TrendingSection
              animeList={topRatedMovies}
              isLoading={isLoading}
              showRank
            />
          </Container>
        </Box>

        {/* Most Favorited Section */}
        <Box
          sx={{
            //mt: { xs: 3, sm: 3, md: 4, lg: 5 },
            py: { xs: 3, sm: 3, md: 4, lg: 5 },
            backgroundColor:
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.background.alternate,
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <MilitaryTechIcon
                  color="warning"
                  sx={{ mr: 1, fontSize: "2rem" }}
                />
                <Typography
                  variant="h3"
                  component="h2"
                  fontWeight="bold"
                  fontSize={{
                    xs: "1.2rem",
                    sm: "1.4rem",
                    md: "1.6rem",
                    lg: "2rem",
                  }}
                >
                  Most Favorited
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/view-all?category=movies"
                endIcon={<ArrowForwardIcon />}
                color="primary"
              >
                View All
              </Button>
            </Box>

            <TrendingSection
              animeList={mostFavoritedAnime}
              isLoading={isLoading}
              showRank
            />
          </Container>
        </Box>
        {/* Call to Action Section */}
        {!isAuthenticated && (
          <Box
            sx={{
              //mt: 8,
              py: 8,
              px: 2,
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              color: "white",
              textAlign: "center",
            }}
          >
            <Container
              maxWidth="md"
              sx={{
                p: { xs: 4, md: 5 },
                borderRadius: 2,
                backgroundColor: "primary.main",
                backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                fontWeight="bold"
                gutterBottom
              >
                Track Your Anime Journey
              </Typography>
              <Typography
                variant="h6"
                sx={{ mb: 4, opacity: 0.9, fontWeight: { xs: 500, md: 600 } }}
              >
                Create a free account to track your watch history, build your
                watchlist, and get personalized recommendations.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/auth/register"
                  sx={{
                    backgroundColor: "white",
                    color: "white",
                    fontWeight: "bold",
                    px: 4,
                    "&:hover": {
                      backgroundColor: alpha("#ffffff", 0.9),
                    },
                  }}
                >
                  Sign Up Now
                </Button>
                <Button
                  variant=""
                  size="large"
                  component={Link}
                  href="/auth/login"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: alpha("#ffffff", 0.1),
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Container>
          </Box>
        )}
      </Box>
    </>
  );
}

// Helper function for alpha colors
function alpha(color, opacity) {
  return (
    color +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
}
