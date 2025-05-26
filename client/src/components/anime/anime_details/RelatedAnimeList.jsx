import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";

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

const RelationTitle = styled(Typography)(({ theme, mobileView }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  paddingLeft: theme.spacing(1),
  marginBottom: theme.spacing(1),
  fontWeight: 500,
  fontSize: mobileView ? "0.9rem" : "inherit",
}));

const RelatedAnimeList = ({ relatedEntries, mobileView = false }) => {
  if (!relatedEntries || Object.keys(relatedEntries).length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ py: 3 }}>
        No related anime information available.
      </Typography>
    );
  }

  return (
    <Box>
      {Object.entries(relatedEntries).map(([relation, entries], idx) => (
        <Box key={idx} sx={{ mb: mobileView ? 2 : 3 }}>
          <RelationTitle
            variant={mobileView ? "subtitle2" : "subtitle1"}
            gutterBottom
            mobileView={mobileView}
          >
            {relation}
          </RelationTitle>

          <Grid container spacing={mobileView ? 1 : 2}>
            {entries.slice(0, mobileView ? 4 : 6).map((entry, entryIdx) => {
              const isManga = entry.url?.includes("manga");

              const cardContent = (
                <AnimeCard
                  sx={{
                    opacity: isManga ? 0.8 : 1,
                  }}
                  mobileView={mobileView}
                >
                  <ImageContainer mobileView={mobileView}>
                    <Image
                      src={entry.imageUrl || "/images/image_not_available.webp"}
                      alt={entry.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </ImageContainer>
                  <Typography
                    variant={mobileView ? "body2" : "subtitle2"}
                    noWrap
                    sx={{
                      mt: 1,
                      color: "text.primary",
                      fontSize: mobileView ? "0.8rem" : "inherit",
                    }}
                  >
                    {entry.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: mobileView ? "0.7rem" : "inherit" }}
                  >
                    {entry.type}
                  </Typography>
                </AnimeCard>
              );

              return (
                <Grid
                  size={{
                    xs: 4,
                    sm: mobileView ? 3 : 3,
                    md: mobileView ? 3 : 2,
                    lg: 2,
                  }}
                  key={entryIdx}
                >
                  {isManga ? (
                    <Box>{cardContent}</Box>
                  ) : (
                    <Link
                      href={entry.id || "#"}
                      passHref
                      style={{ textDecoration: "none" }}
                    >
                      {cardContent}
                    </Link>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default RelatedAnimeList;
