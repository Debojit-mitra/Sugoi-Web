import React from "react";
import { useRouter } from "next/router";
import {
  Grid,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Typography,
  Chip,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import { getGenreColor } from "../../utils/extra";

const SeasonalSection = ({ animeList = [], isLoading }) => {
  const theme = useTheme();
  const router = useRouter();

  // Handle clicking on an anime card
  const handleAnimeClick = (animeId) => {
    router.push(`/anime/${animeId}`);
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(8)].map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: 0,
                  paddingTop: "56.25%", // 16:9 aspect ratio
                }}
              />
              <CardContent>
                <Skeleton variant="text" width="70%" sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Skeleton variant="rectangular" width={60} height={24} />
                  <Skeleton variant="rectangular" width={60} height={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // No data
  if (!animeList.length) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          No seasonal anime data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} className="animate-fade-in">
      {animeList.map((anime, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={anime.id || index}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0 12px 20px ${alpha(
                  theme.palette.common.black,
                  0.2
                )}`,
              },
            }}
            elevation={3}
          >
            <CardActionArea
              onClick={() => handleAnimeClick(anime.id)}
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              {/* Image */}
              <CardMedia
                component="img"
                height="200"
                image={anime.imageUrl || "/images/placeholder.jpg"}
                alt={anime.title}
                sx={{ objectFit: "cover" }}
              />

              {/* Content */}
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Title */}
                <Typography
                  variant="h6"
                  component="h3"
                  className="text-truncate-2"
                  gutterBottom
                  sx={{
                    fontWeight: "medium",
                    fontSize: "1.1rem",
                    lineHeight: 1.3,
                  }}
                >
                  {anime.title}
                </Typography>

                {/* Metadata */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  {anime.type && (
                    <Chip
                      label={anime.type}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)",
                      }}
                    />
                  )}
                  {anime.episodes && (
                    <Typography variant="body2" color="text.secondary">
                      {anime.episodes} eps
                    </Typography>
                  )}
                  {anime.score && (
                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: theme.palette.warning.main,
                        ml: "auto",
                        fontWeight: "medium",
                      }}
                    >
                      ★ {anime.score}
                    </Typography>
                  )}
                </Box>

                {/* Genres */}
                {anime.genres && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}
                  >
                    {anime.genres.slice(0, 5).map((genre, idx) => (
                      <Chip
                        key={idx}
                        label={genre}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.7rem",
                          backgroundColor: alpha(
                            getGenreColor(genre, theme),
                            theme.palette.mode === "dark" ? 0.3 : 0.9
                          ),
                          color:
                            theme.palette.mode === "dark" ? "white" : "white",
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SeasonalSection;
