import React from "react";
import { Box, Typography, Grid, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const AnimeCard = styled(Box)(({ theme, mobileView }) => ({
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const ImageContainer = styled(Box)(({ theme, mobileView }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: mobileView ? theme.shadows[1] : theme.shadows[2],
  height: 0,
  width: "100%",
  paddingTop: "150%", // 2:3 aspect ratio
}));

const RecommendersChip = styled(Chip)(({ theme, mobileView }) => ({
  position: "absolute",
  bottom: mobileView ? 4 : 8,
  right: mobileView ? 4 : 8,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "#fff",
  fontSize: mobileView ? "0.65rem" : "0.75rem",
  height: mobileView ? 20 : 24,
  "& .MuiChip-icon": {
    fontSize: mobileView ? "0.8rem" : "1rem",
    color: "#fff",
  },
}));

const RecommendationsList = ({
  recommendations,
  mobileView = false,
  limit = 6,
}) => {
  // Adjust limit based on mobile view
  const displayLimit = mobileView ? 4 : limit;

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography
        variant={mobileView ? "subtitle1" : "h6"}
        gutterBottom
        sx={{
          borderLeft: "4px solid",
          borderColor: "secondary.main",
          pl: 1,
          mb: mobileView ? 1.5 : 2,
          fontSize: mobileView ? "1.1rem" : undefined,
        }}
      >
        Recommendations
      </Typography>

      <Grid container spacing={mobileView ? 1 : 2}>
        {recommendations.slice(0, displayLimit).map((item, idx) => (
          <Grid size={{ xs: 4, sm: mobileView ? 4 : 3, md: 2 }} key={idx}>
            <Link
              href={item.animeId || "#"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <AnimeCard mobileView={mobileView}>
                <Box sx={{ position: "relative" }}>
                  <ImageContainer mobileView={mobileView}>
                    <Image
                      src={item.imageUrl || "/images/image_not_available.webp"}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                    />
                    {item.recommenders && (
                      <RecommendersChip
                        size="small"
                        icon={<PeopleAltIcon />}
                        label={item.recommenders}
                        mobileView={mobileView}
                      />
                    )}
                  </ImageContainer>
                </Box>
                <Typography
                  variant={mobileView ? "body2" : "subtitle2"}
                  noWrap
                  sx={{
                    mt: mobileView ? 0.5 : 1,
                    color: "text.primary",
                    fontSize: mobileView ? "0.8rem" : undefined,
                  }}
                >
                  {item.title}
                </Typography>
              </AnimeCard>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendationsList;
