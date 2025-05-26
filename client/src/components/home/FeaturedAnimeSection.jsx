/**
 * FeaturedAnime Component
 *
 * A responsive carousel component that displays featured anime with automatic rotation,
 * navigation controls, and detailed information about each anime.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.featuredAnime - Array of anime objects to be featured in the carousel
 * @param {boolean} props.isLoading - Loading state indicator
 * @returns {JSX.Element} Rendered component
 */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { getGenreColor } from "../../utils/extra";
import Link from "next/link";

const FeaturedAnime = ({ featuredAnime = [], isLoading }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Constants
  const AUTOPLAY_INTERVAL = 3000; // 3 seconds
  const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";
  const NOT_AVAILABLE_IMAGE = "/images/image_not_available.webp";

  /**
   * Auto-rotate featured anime on a timer
   */
  useEffect(() => {
    if (!autoplay || !featuredAnime.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredAnime.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [autoplay, featuredAnime.length]);

  /**
   * Pause autoplay on mouse enter
   */
  const handleMouseEnter = () => setAutoplay(false);

  /**
   * Resume autoplay on mouse leave
   */
  const handleMouseLeave = () => setAutoplay(true);

  /**
   * Navigate to previous anime in the carousel
   */
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredAnime.length - 1 : prevIndex - 1
    );
  };

  /**
   * Navigate to next anime in the carousel
   */
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredAnime.length);
  };

  /**
   * Navigate to the details page of the specified anime
   * @param {string|number} animeId - ID of the anime to view
   */
  const handleViewDetails = (animeId) => {
    router.push(`/anime/${animeId}`);
  };

  // Current featured anime
  const currentAnime = featuredAnime[currentIndex];

  /**
   * Renders a loading skeleton when data is being fetched
   * @returns {JSX.Element} Loading skeleton
   */
  const renderLoadingSkeleton = () => (
    <Box
      sx={{
        height: { xs: "50vh", md: "50vh" },
        width: "100%",
        position: "relative",
        bgcolor: "background.paper",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          p: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="xl">
          <Skeleton variant="text" width="60%" height={60} />
          <Skeleton variant="text" width="40%" height={30} />
          <Skeleton variant="text" width="80%" height={80} />
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={40} />
            <Skeleton variant="rectangular" width={120} height={40} />
          </Box>
        </Container>
      </Box>
    </Box>
  );

  /**
   * Renders metadata item with consistent styling
   * @param {string|number} content - Content to display
   * @returns {JSX.Element} Styled metadata item
   */
  const renderMetadataItem = (content) => (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Typography variant="body2" fontWeight="medium">
        {content}
      </Typography>
    </Box>
  );

  // If loading or no data available, show skeleton
  if (isLoading || !currentAnime) {
    return renderLoadingSkeleton();
  }

  return (
    <Box
      sx={{
        height: { xs: "70vh", sm: "60vh", md: "60vh", lg: "55vh" },
        width: "100%",
        position: "relative",
        overflow: "hidden",
        color: "white",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background image with improved gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
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
          src={currentAnime.imageUrl || NOT_AVAILABLE_IMAGE}
          alt={currentAnime.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(8px)",
            transform: "scale(1.1)", // To cover the edges after blur
            transition: "transform 0.5s ease",
          }}
        />
      </Box>

      <Link
        href={"/anime/" + currentAnime.animeId || "#"}
        passHref
        style={{ textDecoration: "none" }}
      >
        {/* Content container */}
        <Container
          maxWidth="xl"
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "relative",
            zIndex: 2,
            pb: { xs: 4, sm: 5, md: 6 },
            pt: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "center" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {/* Anime poster */}
            <Box
              sx={{
                width: { xs: "160px", sm: "180px", md: "200px", lg: "220px" },
                height: { xs: "240px", sm: "270px", md: "290px", lg: "320px" },
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                transition: "transform 0.3s ease",
                alignSelf: { xs: "center", md: "flex-start" },
                mb: { xs: 1, sm: 1.5, md: 3, lg: 5 },
                mx: { xs: "auto", md: 0 },
                position: "relative", // Add this line
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <Box
                component="img"
                src={currentAnime.imageUrl || PLACEHOLDER_IMAGE}
                alt={currentAnime.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Add the rating box here */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background:
                    "linear-gradient(45deg, #6200EA 30%, #9C27B0 90%)",
                  color: "white",
                  px: { xs: 0.8, sm: 0.85, md: 0.9, lg: 1 },
                  py: 0.5,
                  borderTopLeftRadius: 15,
                  borderRight: "none",
                  borderBottom: "none",
                  display: currentAnime.score ? "flex" : "none", // Only show when score exists
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <StarIcon
                  sx={{ color: "warning.main", fontSize: "0.875rem" }}
                />
                <Typography variant="body2" fontWeight="bold">
                  {currentAnime.score || ""}
                </Typography>
              </Box>
            </Box>

            {/* Anime details */}
            <Box
              sx={{
                flex: 1,
                maxWidth: { xs: "100%", md: "70%", lg: "60%" },
                mb: { xs: 2, sm: 2.5, md: 3, lg: 3 },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {/* Title */}
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: {
                    xs: "1.2rem",
                    sm: "1.4rem",
                    md: "1.7rem",
                    lg: "2.2rem",
                  },
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  mb: 1,
                  lineHeight: 1.2,
                  color: "common.white",
                  textDecoration: "none",
                }}
              >
                {currentAnime.title}
              </Typography>

              {/* Genres and Episodes*/}
              <Box
                sx={{
                  mt: 2,
                  width: "100%",
                  position: "relative",
                  overflowX: "auto",
                  msOverflowStyle: "none" /* Hide scrollbar for IE and Edge */,
                  scrollbarWidth: "none" /* Hide scrollbar for Firefox */,
                  "&::-webkit-scrollbar": {
                    /* Hide scrollbar for Chrome, Safari, and Opera */
                    display: "none",
                  },
                  // Add padding to ensure items aren't flush with container edges
                  px: { xs: 2, sm: 2, md: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    width: "fit-content", // Only take the space needed
                    mx: { xs: "auto", md: 0 }, // Center on mobile, left-align on desktop
                    // This ensures the scroll starts with visibility of the first item
                    position: "relative",
                    left: { xs: "-8px", sm: 0 }, // Slight adjustment to ensure first badge is visible
                  }}
                >
                  {/* Episodes badge */}
                  <React.Fragment>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: "rgba(255, 69, 0, 0.3)",
                        padding: "5px 10px",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.75rem",
                          md: "0.8rem",
                          lg: "0.85rem",
                        },
                        color:
                          theme.palette.mode === "dark" ? "#FFB266" : "#CC4400",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        display:
                          currentAnime.episodes &&
                          currentAnime.episodes !== "?" &&
                          currentAnime.episodes !== "" &&
                          currentAnime.episodes.toLowerCase() !== "n/a"
                            ? "inline-block"
                            : "none",
                      }}
                    >
                      {currentAnime.episodes &&
                      currentAnime.episodes !== "?" &&
                      currentAnime.episodes !== "" &&
                      currentAnime.episodes.toLowerCase() !== "n/a"
                        ? `${currentAnime.episodes} Eps`
                        : ""}
                    </Box>
                    <Box
                      sx={{
                        marginInline: 1,
                        color: "white",
                        flexShrink: 0,
                        display:
                          currentAnime.episodes &&
                          currentAnime.episodes !== "?" &&
                          currentAnime.episodes !== "" &&
                          currentAnime.episodes.toLowerCase() !== "n/a"
                            ? "inline-block"
                            : "none",
                      }}
                    >
                      ✦
                    </Box>
                  </React.Fragment>

                  {/* Genre badges */}
                  {currentAnime.genres &&
                    currentAnime.genres.slice(0, 5).map((genre, idx) => (
                      <React.Fragment key={idx}>
                        <Box
                          component="span"
                          sx={{
                            color: getGenreColor(genre, theme),
                            fontWeight: 500,
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.75rem",
                              md: "0.8rem",
                              lg: "0.85rem",
                            },
                            backgroundColor: "rgba(98, 0, 234, 0.3)",
                            padding: "5px 10px",
                            borderRadius: 10,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {genre}
                        </Box>
                        {idx !== currentAnime.genres.slice(0, 5).length - 1 && (
                          <Box
                            component="span"
                            sx={{
                              marginInline: 1,
                              fontWeight: 600,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            ✦
                          </Box>
                        )}
                      </React.Fragment>
                    ))}
                </Box>
              </Box>

              {/* Action buttons */}
              <Box
                sx={{
                  display: "flex",
                  mt: 2,
                  gap: { xs: 1, sm: 2 },
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleViewDetails(currentAnime.id)}
                  sx={{
                    borderRadius: 2,
                    px: { xs: 1.5, sm: 2, md: 2.3, lg: 2.6 },
                    fontWeight: "bold",
                    background:
                      "linear-gradient(45deg, #6200EA 30%, #9C27B0 90%)",
                    boxShadow: "0 4px 20px rgba(98, 0, 234, 0.5)",
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.85rem",
                      md: "0.95rem",
                      lg: "1.1rem",
                    },
                  }}
                >
                  Watch Now
                </Button>

                <Button
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<InfoIcon />}
                  onClick={() => handleViewDetails(currentAnime.id)}
                  sx={{
                    borderRadius: 2,
                    px: { xs: 2, sm: 3 },
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Details
                </Button>

                {/* Add to List button - hidden on smallest screens */}
                <Button
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    px: { xs: 2, sm: 3 },
                    borderColor: "white",
                    color: "white",
                    display: isMobile ? "none" : "inline-flex", // Hide on mobile using CSS instead of conditional rendering
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Add to List
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Link>

      {/* Navigation arrows - only shown when multiple anime are available */}
      <IconButton
        onClick={handlePrev}
        aria-label="Previous anime"
        sx={{
          position: "absolute",
          left: { xs: 8, sm: 16, md: 24, lg: 30 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          zIndex: 10,
          display: featuredAnime.length > 1 ? "flex" : "none", // Only show when multiple anime
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowBackIosIcon fontSize={isMobile ? "small" : "medium"} />
      </IconButton>

      <IconButton
        onClick={handleNext}
        aria-label="Next anime"
        sx={{
          position: "absolute",
          right: { xs: 8, sm: 16, md: 24, lg: 30 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          zIndex: 3,
          display: featuredAnime.length > 1 ? "flex" : "none", // Only show when multiple anime
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowForwardIosIcon fontSize={isMobile ? "small" : "medium"} />
      </IconButton>

      {/* Indicator dots - only shown when multiple anime are available */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 12, sm: 16, md: 20 },
          left: "50%",
          transform: "translateX(-50%)",
          display: featuredAnime.length > 1 ? "flex" : "none", // Only visible when multiple anime
          gap: { xs: 0.75, sm: 1 },
          zIndex: 3,
        }}
      >
        {featuredAnime.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            role="button"
            tabIndex={0}
            sx={{
              width: { xs: 5, sm: 6, md: 7, lg: 8 },
              height: { xs: 5, sm: 6, md: 7, lg: 8 },
              borderRadius: "50%",
              bgcolor: (theme) =>
                index === currentIndex
                  ? "primary.main"
                  : theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.5)" // Light dots in dark mode
                  : "rgba(0, 0, 0, 0.5)", // Dark dots in light mode
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.2)",
                bgcolor: (theme) =>
                  index === currentIndex
                    ? "primary.main"
                    : theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.8)" // Lighter on hover in dark mode
                    : "rgba(0, 0, 0, 0.7)", // Darker on hover in light mode
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FeaturedAnime;
