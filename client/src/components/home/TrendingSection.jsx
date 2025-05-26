import React from "react";
import { useRouter } from "next/router";
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Skeleton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import Image from "next/image";
import { StarRounded as StarIcon } from "@mui/icons-material";
import Link from "next/link";

const TrendingSection = ({ animeList = [], isLoading, showRank = false }) => {
  const theme = useTheme();

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[...Array(12)].map((_, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={index}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: 0,
                  paddingTop: "150%", // 2:3 aspect ratio for anime posters
                  position: "relative",
                }}
              />
              <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
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
          No anime data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={{ xs: 1, sm: 1.5, md: 2, lg: 3 }}
      className="animate-fade-in"
    >
      {animeList.map((anime, index) => (
        <Grid size={{ xs: 4, sm: 3, md: 3, lg: 2 }} key={anime.id || index}>
          <Link
            href={"/anime/" + anime.animeId || "#"}
            passHref
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                height: "98%",
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
                sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
              >
                {/* Rank badge for top anime */}
                {showRank && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      px: 1.5,
                      py: 0.5,
                      fontWeight: "bold",
                      zIndex: 1,
                      borderBottomRightRadius: 8,
                    }}
                  >
                    #{index + 1}
                  </Box>
                )}

                {/* Image */}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 180, sm: 220, md: 250, lg: 310 },
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
                      src={anime.imageUrl || "/images/image_not_available.webp"}
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
                        variant="body3"
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
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="body3"
                    className="text-truncate-2"
                    fontWeight="500"
                    sx={{
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.8rem",
                        md: "0.9rem",
                        lg: "1.1rem",
                      },
                      mb: { xs: 0, sm: 0.2, md: 0.4, lg: 0.6 },
                      lineHeight: 1.1,
                    }}
                  >
                    {anime.title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Type & Episodes */}
                    <Box sx={{ textAlign: "center", width: "100%" }}>
                      {anime.type && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: "0.8rem",
                              lg: "1rem",
                            },
                          }}
                        >
                          {anime.type}{" "}
                          {anime.episodes && `(${anime.episodes} eps)`}
                        </Typography>
                      )}
                    </Box>

                    {/* Status indicator */}
                    {anime.status && (
                      <Chip
                        label={
                          anime.status === "Currently Airing"
                            ? "Airing"
                            : anime.status === "Finished Airing"
                            ? "Completed"
                            : anime.status
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.625rem",
                          backgroundColor:
                            anime.status === "Currently Airing"
                              ? "success.main"
                              : anime.status === "Finished Airing"
                              ? "info.main"
                              : "warning.main",
                          color: "white",
                        }}
                      />
                    )}
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

export default TrendingSection;
