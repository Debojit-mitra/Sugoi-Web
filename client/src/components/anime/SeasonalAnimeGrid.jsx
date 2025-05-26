import React from "react";
import { useRouter } from "next/router";
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  StarRounded as StarIcon,
  TvTwoTone as TvIcon,
  TheatersTwoTone as MovieIcon,
  OndemandVideoTwoTone as OnaIcon,
  VideocamTwoTone as OvaIcon,
  EmojiEventsTwoTone as SpecialIcon,
} from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
const SeasonalAnimeGrid = ({ animeList = [] }) => {
  const theme = useTheme();
  const router = useRouter();

  // Function to get appropriate icon based on anime type
  const getAnimeTypeIcon = (type) => {
    switch (type) {
      case "TV":
        return <TvIcon fontSize="small" />;
      case "Movie":
        return <MovieIcon fontSize="small" />;
      case "ONA":
        return <OnaIcon fontSize="small" />;
      case "OVA":
        return <OvaIcon fontSize="small" />;
      case "Special":
        return <SpecialIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // No data
  if (!animeList.length) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          No anime found for this season and type.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} className="animate-fade-in">
      {animeList.map((anime, index) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={anime.id || index}>
          <Link
            href={"/anime/" + anime.animeId || "#"}
            passHref
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                background: "rgba(0, 0, 0, 0.1)",
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
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  justifyContent: "flex-start",
                }}
              >
                {/* Image */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 240, md: 280, lg: 310 },
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: 1.5,
                      overflow: "hidden", // Important for borderRadius to work with next/image
                    }}
                  >
                    <Image
                      src={
                        anime.imageUrl ||
                        anime.imageLarge ||
                        "/images/image_not_available.webp"
                      }
                      alt={anime.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                  {/* Score badge */}
                  {anime.score && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        background:
                          "linear-gradient(45deg, #6200EA 30%, #9C27B0 90%)",
                        color: "white",
                        px: { xs: 0.5, sm: 0.6, md: 0.7, lg: 0.8 },
                        py: { xs: 0.4, sm: 0.5, md: 0.6, lg: 0.7 },
                        borderTopLeftRadius: { xs: 15, sm: 16, md: 18, lg: 20 },
                        borderBottomRightRadius: 12,
                        borderRight: "none",
                        borderBottom: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.2,
                      }}
                    >
                      <StarIcon
                        sx={{
                          ml: 0.2,
                          color: "warning.main",
                          fontSize: {
                            xs: "0.875rem",
                            md: "1rem",
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        fontSize={{
                          xs: "0.7rem",
                          sm: "0.75rem",
                          md: "0.8rem",
                          lg: "0.85rem",
                        }}
                      >
                        {anime.score}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Content */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: { xs: 1, sm: 1.2, md: 1.3, lg: 1.5 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {/* Title Section */}
                  <Box sx={{ mb: { xs: 1, sm: 1.2, md: 1.5, lg: 2 } }}>
                    <Typography
                      variant="body1"
                      className="text-truncate-2"
                      fontWeight="500"
                      sx={{
                        fontSize: {
                          xs: "0.8rem",
                          sm: "0.9rem",
                          md: "1rem",
                          lg: "1.1rem",
                        },
                        lineHeight: 1.2,

                        minHeight: {
                          xs: "2.4em",
                          sm: "2.4em",
                          md: "2.4em",
                          lg: "2.4em",
                        },
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {anime.title}
                    </Typography>
                  </Box>

                  {/* Details Section */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    {/* Episodes and Date */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.light"
                        fontWeight={600}
                        sx={{
                          fontSize: {
                            xs: "0.65rem",
                            sm: "0.7rem",
                            md: "0.75rem",
                            lg: "0.8rem",
                          },
                        }}
                      >
                        {anime.episodes &&
                          `${anime.episodes} Ep${
                            anime.episodes === "1" ? "" : "s"
                          }`}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: {
                            xs: "0.65rem",
                            sm: "0.7rem",
                            md: "0.75rem",
                            lg: "0.8rem",
                          },
                        }}
                      >
                        {anime.date || anime.type || "TBA"}
                      </Typography>
                    </Box>

                    <Divider sx={{ width: "100%", my: 0.5 }} />

                    {/* Genres */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        gap: 0.5,
                        mt: 0.5,
                        width: "100%",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                          display: "none",
                        },
                      }}
                    >
                      {anime.genres &&
                        Array.isArray(anime.genres) &&
                        anime.genres.map((genre, idx) => (
                          <Chip
                            key={idx}
                            label={genre}
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              height: "1.4rem",
                              flexShrink: 0,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.1)"
                                  : "rgba(0,0,0,0.05)",
                            }}
                          />
                        ))}
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

export default SeasonalAnimeGrid;
