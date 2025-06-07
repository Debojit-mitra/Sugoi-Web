import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Container,
  Grid,
  Chip,
  Divider,
  Paper,
  Rating,
  Button,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";

import {
  fetchAnimeDetails,
  clearAnimeDetails,
} from "../../src/redux/slices/animeSlice";
import CharactersList from "../../src/components/anime/anime_details/CharactersList";
import RelatedAnimeList from "../../src/components/anime/anime_details/RelatedAnimeList";
import MusicThemesList from "../../src/components/anime/anime_details/MusicThemesList";
import RecommendationsList from "../../src/components/anime/anime_details/RecommendationsList";
import AnimeActionButtons from "../../src/components/anime/anime_details/AnimeActionButtons";
import TrailerPlayer from "../../src/components/anime/anime_details/TrailerPlayer";
import MobileAnimeDetailView from "../../src/components/anime/anime_details/MobileAnimeDetailView";
import Head from "next/head";

// Custom styled components
const AnimeHeader = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  marginBottom: theme.spacing(4),
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)",
}));

const ContentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 40, 0.9)"
      : "rgba(255, 255, 255, 0.95)",
  boxShadow: theme.shadows[3],
}));

const AnimeImageWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: theme.shadows[5],
  height: "auto",
  [theme.breakpoints.up("md")]: {
    height: "350px",
    width: "auto",
  },
}));

const AnimeBanner = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "250px",
  position: "relative",
  backgroundSize: "cover",
  backgroundPosition: "center",
  marginBottom: theme.spacing(3),
  filter: "blur(8px)",
  [theme.breakpoints.up("md")]: {
    height: "400px",
  },
}));

const CharacterItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "120px",
  margin: theme.spacing(1),
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const CharacterImageWrapper = styled(Box)(({ theme }) => ({
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: theme.spacing(1),
  border: `2px solid ${theme.palette.primary.main}`,
}));

const RelatedAnimeCard = styled(Box)(({ theme }) => ({
  width: "150px",
  margin: theme.spacing(1),
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconFilled": {
    color: theme.palette.secondary.main,
  },
}));

const AnimeDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { animeDetails, isLoading, error } = useSelector(
    (state) => state.anime
  );
  const [tabValue, setTabValue] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [watchlist, setWatchlist] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAnimeDetails(id));
    }

    return () => {
      dispatch(clearAnimeDetails());
    };
  }, [id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
    // You can add API call to update user favorites here
  };

  const toggleWatchlist = () => {
    setWatchlist(!watchlist);
    // You can add API call to update user watchlist here
  };

  const [studioWorks, setStudioWorks] = useState([]);
  const [loadingStudioWorks, setLoadingStudioWorks] = useState(false);

  // Fetch anime from the same studio when studio info is available
  useEffect(() => {
    if (animeDetails?.studios && Object.keys(animeDetails.studios).length > 0) {
      const studioName = Object.keys(animeDetails.studios)[0];
      // This would be replaced with an actual API call in production
      // For demo purposes, we'll simulate it with the recommendations data
      setLoadingStudioWorks(true);

      // Simulate API call delay
      setTimeout(() => {
        if (
          animeDetails.recommendations &&
          animeDetails.recommendations.length > 0
        ) {
          const mockStudioWorks = animeDetails.recommendations
            .slice(0, 6)
            .map((anime) => ({
              ...anime,
              studio: studioName,
            }));
          setStudioWorks(mockStudioWorks);
        }
        setLoadingStudioWorks(false);
      }, 1000);
    }
  }, [animeDetails]);

  // If loading
  if (isLoading) {
    // Different skeletons for mobile/tablet vs desktop
    if (isTablet) {
      return (
        <>
          {/* Banner Skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height="40vh"
            animation="wave"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />

          {/* Mobile Layout Skeleton */}
          <Box sx={{ mt: 25, mb: 4, position: "relative", zIndex: 2 }}>
            {/* Main Header with Image and Title Section */}
            <Box sx={{ px: 2, mb: 2 }}>
              <Box sx={{ display: "flex", mb: 2 }}>
                {/* Poster Skeleton */}
                <Box
                  sx={{
                    width: "40%",
                    position: "relative",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={225}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>

                {/* Title and Rating Section */}
                <Box sx={{ pl: 2, width: "60%" }}>
                  <Skeleton
                    animation="wave"
                    width="90%"
                    height={28}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    animation="wave"
                    width="80%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ my: 1 }}>
                    <Skeleton animation="wave" width={120} height={24} />
                    <Skeleton
                      animation="wave"
                      width={60}
                      height={18}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  {/* Action Buttons Row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </Box>
              </Box>

              {/* Genres Tags */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  my: 1,
                  justifyContent: "center",
                }}
              >
                {[1, 2, 3, 4, 5].map((chip) => (
                  <Skeleton
                    key={chip}
                    animation="wave"
                    width={70}
                    height={24}
                    sx={{ borderRadius: 4, mb: 0.5 }}
                  />
                ))}
              </Box>

              {/* Anime Details */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Skeleton
                  animation="wave"
                  width={120}
                  height={24}
                  sx={{ mb: 1.5 }}
                />
                {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.75,
                    }}
                  >
                    <Skeleton animation="wave" width="30%" height={18} />
                    <Skeleton animation="wave" width="60%" height={18} />
                  </Box>
                ))}
              </Box>

              {/* Synopsis Skeleton */}
              <Box sx={{ mt: 2, mb: 1 }}>
                <Skeleton
                  animation="wave"
                  width={100}
                  height={24}
                  sx={{ mb: 1 }}
                />
                <Skeleton animation="wave" width="100%" height={18} />
                <Skeleton animation="wave" width="100%" height={18} />
                <Skeleton animation="wave" width="100%" height={18} />
                <Skeleton animation="wave" width="90%" height={18} />
                <Skeleton
                  animation="wave"
                  width={100}
                  height={30}
                  sx={{ mt: 1 }}
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 2 }}>
                <Skeleton animation="wave" width="100%" height={40} />
              </Box>
            </Box>

            {/* Content Tabs Skeleton */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Box sx={{ display: "flex" }}>
                  {[1, 2, 3, 4].map((tab, index) => (
                    <Skeleton
                      key={tab}
                      animation="wave"
                      width={80}
                      height={35}
                      sx={{ mr: 1 }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Tab Content Skeleton - Characters Grid */}
              <Grid container spacing={1}>
                {[1, 2, 3, 4].map((char) => (
                  <Grid size={{ xs: 6 }} key={char}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        animation="wave"
                        width={80}
                        height={80}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton animation="wave" width={60} height={16} />
                      <Skeleton animation="wave" width={40} height={14} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Recommendations Skeleton */}
            <Paper sx={{ p: 2 }}>
              <Skeleton
                animation="wave"
                width={150}
                height={24}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={1}>
                {[1, 2, 3, 4].map((rec) => (
                  <Grid size={{ xs: 6 }} key={rec}>
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      width="100%"
                      height={130}
                      sx={{ borderRadius: 1, mb: 1 }}
                    />
                    <Skeleton animation="wave" width="80%" height={16} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </>
      );
    } else {
      // Desktop Layout Skeleton
      return (
        <>
          {/* Banner Skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height="50vh"
            animation="wave"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />

          <Container
            maxWidth="lg"
            sx={{
              mt: 30,
              mb: 4,
              position: "relative",
              zIndex: 2,
            }}
          >
            <Grid container spacing={3}>
              {/* Left Column - Poster and Details Skeleton */}
              <Grid size={{ xs: 12, md: 3 }} sx={{ mb: 0 }}>
                <Box sx={{ position: "sticky", top: 24 }}>
                  {/* Anime Poster Skeleton */}
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      backgroundColor: "background.alternate",
                      boxShadow: 5,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      animation="wave"
                      width="100%"
                      height="350px"
                    />
                  </Box>

                  {/* Action Buttons Skeleton */}
                  <ContentCard
                    sx={{ mt: 2, backgroundColor: "background.alternate" }}
                  >
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Skeleton
                              animation="wave"
                              width="30%"
                              height={20}
                            />
                          }
                          secondary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Skeleton
                                animation="wave"
                                width={120}
                                height={24}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                        <React.Fragment key={item}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Skeleton
                                  animation="wave"
                                  width="30%"
                                  height={20}
                                />
                              }
                              secondary={
                                <Skeleton
                                  animation="wave"
                                  width="60%"
                                  height={20}
                                />
                              }
                            />
                          </ListItem>
                          {item < 7 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </ContentCard>
                </Box>
              </Grid>

              {/* Right Column - Main Content Skeleton */}
              <Grid size={{ xs: 12, md: 9 }}>
                {/* Title and Synopsis Skeleton */}
                <ContentCard sx={{ backgroundColor: "background.alternate" }}>
                  <Skeleton
                    animation="wave"
                    width="80%"
                    height={40}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    animation="wave"
                    width="60%"
                    height={30}
                    sx={{ mb: 2 }}
                  />

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}
                  >
                    {[1, 2, 3, 4, 5].map((chip) => (
                      <Skeleton
                        key={chip}
                        animation="wave"
                        width={80}
                        height={32}
                        sx={{ borderRadius: 4 }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mt: 4, mb: 2 }}>
                    <Skeleton
                      animation="wave"
                      width={120}
                      height={30}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      animation="wave"
                      width="100%"
                      height={25}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      animation="wave"
                      width="100%"
                      height={25}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      animation="wave"
                      width="100%"
                      height={25}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      animation="wave"
                      width="90%"
                      height={25}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton
                      animation="wave"
                      width="95%"
                      height={25}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Skeleton animation="wave" width={100} height={40} />
                      <Skeleton animation="wave" width={100} height={40} />
                      <Skeleton animation="wave" width={100} height={40} />
                    </Box>
                  </Box>
                </ContentCard>

                {/* Tabs Skeleton */}
                <ContentCard sx={{ backgroundColor: "background.alternate" }}>
                  <Tabs value={0}>
                    <Tab
                      label={
                        <Skeleton animation="wave" width={80} height={24} />
                      }
                    />
                    <Tab
                      label={
                        <Skeleton animation="wave" width={80} height={24} />
                      }
                    />
                    <Tab
                      label={
                        <Skeleton animation="wave" width={80} height={24} />
                      }
                    />
                    <Tab
                      label={
                        <Skeleton animation="wave" width={80} height={24} />
                      }
                    />
                  </Tabs>

                  {/* Characters Grid Skeleton */}
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((char) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={char}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <Skeleton
                              variant="circular"
                              animation="wave"
                              width={100}
                              height={100}
                              sx={{ mb: 1 }}
                            />
                            <Skeleton animation="wave" width={80} height={20} />
                            <Skeleton animation="wave" width={60} height={16} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </ContentCard>

                {/* Recommendations Skeleton */}
                <ContentCard sx={{ backgroundColor: "transparent" }}>
                  <Skeleton
                    animation="wave"
                    width={200}
                    height={30}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5, 6].map((rec) => (
                      <Grid size={{ xs: 6, sm: 4, md: 2 }} key={rec}>
                        <Skeleton
                          variant="rectangular"
                          animation="wave"
                          width="100%"
                          height={200}
                          sx={{ borderRadius: 1, mb: 1 }}
                        />
                        <Skeleton animation="wave" width="80%" height={20} />
                        <Skeleton animation="wave" width="50%" height={16} />
                      </Grid>
                    ))}
                  </Grid>
                </ContentCard>
              </Grid>
            </Grid>
          </Container>
        </>
      );
    }
  }

  // If error
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error loading anime details
          </Typography>
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(fetchAnimeDetails(id))}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  // If no data
  if (!animeDetails) {
    return null;
  }

  // Return mobile layout for mobile and tablet devices
  if (isTablet) {
    return (
      <>
        <Head>
          <title>{animeDetails.title || "Anime Details"} | Sugoi Anime</title>
          <meta
            name="description"
            content={
              animeDetails.synopsis?.substring(0, 160) || "View anime details"
            }
          />
        </Head>

        {/* Mobile Banner Image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "40vh",
            zIndex: 0,
            overflow: "hidden",
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
            src={animeDetails.image || "/images/image_not_available.webp"}
            alt={animeDetails.title}
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

        <MobileAnimeDetailView
          animeDetails={animeDetails}
          favorite={favorite}
          watchlist={watchlist}
          toggleFavorite={toggleFavorite}
          toggleWatchlist={toggleWatchlist}
          tabValue={tabValue}
          handleTabChange={handleTabChange}
          NOT_AVAILABLE_IMAGE="/images/image_not_available.webp"
        />
      </>
    );
  }

  // Desktop layout
  return (
    <>
      <Head>
        <title>{animeDetails.title || "Anime Details"} | Sugoi Anime</title>
        <meta
          name="description"
          content={
            animeDetails.synopsis?.substring(0, 160) || "View anime details"
          }
        />
      </Head>

      {/* Anime Banner with Overlay */}
      {/* <AnimeBanner
        sx={{
          backgroundImage: `url(${animeDetails.image})`,
          backgroundAttachment: "fixed",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Container maxWidth="lg" sx={{ pb: 2 }}>
            <IconButton
              onClick={handleGoBack}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Container>
        </Box>
      </AnimeBanner> */}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "50vh", // only 30% of the viewport height
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
          src={animeDetails.image || NOT_AVAILABLE_IMAGE}
          alt={animeDetails.title}
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

      <Container
        maxWidth="lg"
        sx={{
          mt: 30,
          mb: 4,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Grid container spacing={3}>
          {/* Left Column - Poster and Details */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ mb: isTablet ? 2 : 0 }}>
            <Box sx={{ position: "sticky", top: 24 }}>
              <AnimeImageWrapper>
                {animeDetails.image ? (
                  <Image
                    src={animeDetails.image}
                    alt={animeDetails.title}
                    width={300}
                    height={450}
                    layout="responsive"
                    priority
                  />
                ) : (
                  <Box
                    sx={{
                      bgcolor: "grey.300",
                      height: 450,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2">Image not available</Typography>
                  </Box>
                )}
              </AnimeImageWrapper>

              <ContentCard sx={{ mt: 2, backgroundColor: "transparent" }}>
                {/* <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <IconButton
                    onClick={toggleFavorite}
                    color={favorite ? "secondary" : "default"}
                  >
                    {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <IconButton
                    onClick={toggleWatchlist}
                    color={watchlist ? "primary" : "default"}
                  >
                    {watchlist ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Box> */}
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Score"
                      secondary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StyledRating
                            value={
                              animeDetails.score
                                ? parseFloat(animeDetails.score / 2)
                                : 0
                            }
                            precision={0.5}
                            readOnly
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {animeDetails.score} / 10
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={animeDetails.status || "Unknown"}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Type"
                      secondary={animeDetails.type || "Unknown"}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Episodes"
                      secondary={animeDetails.episodes || "?"}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Duration"
                      secondary={animeDetails.duration || "Unknown"}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Aired"
                      secondary={animeDetails.aired || "Unknown"}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Studios"
                      secondary={
                        animeDetails.studios
                          ? Object.keys(animeDetails.studios).join(", ")
                          : "Unknown"
                      }
                    />
                  </ListItem>
                  {animeDetails.rating && (
                    <>
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary="Rating"
                          secondary={animeDetails.rating || "Unknown"}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </ContentCard>
            </Box>
          </Grid>

          {/* Right Column - Main Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            <ContentCard sx={{ backgroundColor: "transparent" }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {animeDetails.title}
              </Typography>
              {animeDetails.englishTitle && (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                >
                  {animeDetails.englishTitle}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  my: 2,
                }}
              >
                {animeDetails.genres &&
                  animeDetails.genres.map((genre, idx) => (
                    <Chip
                      key={idx}
                      label={genre}
                      size="medium"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 600, borderWidth: 1.5 }}
                    />
                  ))}
                {animeDetails.themes &&
                  animeDetails.themes.map((theme, idx) => (
                    <Chip
                      key={idx}
                      label={theme}
                      size="medium"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, borderWidth: 1.5 }}
                    />
                  ))}
              </Box>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Synopsis
                </Typography>
                <Typography variant="body1" paragraph>
                  {animeDetails.synopsis || "No synopsis available."}
                </Typography>
              </Box>

              {/* Trailer moved to tabs section */}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <AnimeActionButtons
                  onPlay={() => ""}
                  onAddToList={toggleWatchlist}
                  onFavorite={toggleFavorite}
                  onShare={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: animeDetails.title,
                          text: `Check out ${animeDetails.title} on Sugoi Anime!`,
                          url: window.location.href,
                        })
                        .catch((err) => console.debug("Error sharing:", err));
                    } else {
                      navigator.clipboard
                        .writeText(window.location.href)
                        .then(() => alert("Link copied to clipboard!"))
                        .catch((err) =>
                          console.error("Could not copy text: ", err)
                        );
                    }
                  }}
                  isFavorite={favorite}
                  isInList={watchlist}
                  variant="desktop"
                />

                {/* Trailer button removed as it's now displayed as an embedded player */}
              </Box>
            </ContentCard>

            {/* Tabs for Characters, Related Anime, Music */}
            <ContentCard sx={{ backgroundColor: "transparent" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
              >
                <Tab label="Trailer" />
                <Tab label="Characters" />
                <Tab label="Related Anime" />
                <Tab label="Music" />
              </Tabs>

              {/* Trailer Tab */}
              <Box hidden={tabValue !== 0} sx={{ mt: 3 }}>
                {animeDetails.trailerUrlYoutube ? (
                  <TrailerPlayer
                    trailerUrl={animeDetails.trailerUrlYoutube}
                    title={animeDetails.title}
                  />
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No trailer available for this anime.
                  </Typography>
                )}
              </Box>

              {/* Characters Tab */}
              <Box hidden={tabValue !== 1} sx={{ mt: 3 }}>
                <CharactersList
                  characters={animeDetails.characters}
                  limit={18}
                />
              </Box>

              {/* Related Anime Tab */}
              <Box hidden={tabValue !== 2} sx={{ mt: 3 }}>
                <RelatedAnimeList
                  relatedEntries={animeDetails.relatedEntries}
                />
              </Box>

              {/* Music Tab */}
              <Box hidden={tabValue !== 3} sx={{ mt: 3 }}>
                <MusicThemesList musicThemes={animeDetails.musicThemes} />
              </Box>
            </ContentCard>

            {/* Recommendations */}
            {animeDetails.recommendations?.length > 0 && (
              <ContentCard sx={{ backgroundColor: "transparent" }}>
                <RecommendationsList
                  recommendations={animeDetails.recommendations}
                />
              </ContentCard>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AnimeDetailsPage;
