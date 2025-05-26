import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Skeleton,
  useTheme,
  Divider,
} from "@mui/material";

const SkeletonAnimeGrid = ({ count = 12 }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} className="animate-fade-in">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.1)",
              }}
              elevation={3}
            >
              {/* Anime Image Skeleton */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: { xs: "250px", md: "270px" },
                  mt: -2,
                }}
              >
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width="100%"
                  height="100%"
                  sx={{
                    bgcolor: "transparent",
                  }}
                />
              </Box>

              {/* Content */}
              <CardContent
                sx={{
                  width: "100%",
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {/* Title Skeleton */}
                <Box sx={{ width: "100%" }}>
                  <Skeleton
                    animation="wave"
                    height={30}
                    width="80%"
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                  <Skeleton
                    animation="wave"
                    height={20}
                    width="60%"
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                </Box>

                {/* Studio and Episode Info Skeleton */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 1,
                    mt: 1,
                  }}
                >
                  <Skeleton
                    animation="wave"
                    height={20}
                    width="40%"
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                  <Skeleton
                    animation="wave"
                    height={20}
                    width="30%"
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                </Box>

                {/* Rating and Year Skeleton */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    mb: 1.5,
                  }}
                >
                  <Skeleton
                    animation="wave"
                    height={20}
                    width="25%"
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                  <Skeleton
                    animation="wave"
                    height={20}
                    width="25%"
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                </Box>

                <Divider sx={{ width: "100%" }} />

                {/* Genres Skeleton */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    width: "100%",
                    mt: 1,
                  }}
                >
                  <Skeleton
                    animation="wave"
                    height={22}
                    width="20%"
                    sx={{
                      borderRadius: "16px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                  <Skeleton
                    animation="wave"
                    height={22}
                    width="25%"
                    sx={{
                      borderRadius: "16px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                  <Skeleton
                    animation="wave"
                    height={22}
                    width="15%"
                    sx={{
                      borderRadius: "16px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.300",
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
};

export default SkeletonAnimeGrid;
