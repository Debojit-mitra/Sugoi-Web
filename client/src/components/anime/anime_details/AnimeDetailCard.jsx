import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Rating,
  Stack,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import StarIcon from "@mui/icons-material/Star";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Styled components
const CardContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 35, 0.95)"
      : "rgba(255, 255, 255, 0.97)",
}));

const CardImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 0,
  paddingTop: "150%", // 2:3 aspect ratio
  overflow: "hidden",
}));

const CardContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  fontSize: "0.9rem",
  "& .MuiRating-iconFilled": {
    color: theme.palette.secondary.main,
  },
}));

const ScoreChip = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: theme.palette.common.white,
  padding: "2px 6px",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  fontSize: "0.75rem",
  fontWeight: "bold",
  zIndex: 1,
}));

const TypeChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 8,
  left: 8,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: "0.75rem",
  height: 24,
  zIndex: 1,
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "40%",
  background:
    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%)",
  zIndex: 1,
}));

const ActionRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: theme.spacing(1),
}));

const AnimeDetailCard = ({
  anime,
  compact = false,
  onFavorite,
  onWatchlist,
}) => {
  if (!anime) return null;

  return (
    <CardContainer elevation={3}>
      <Link
        href={`/anime/${anime.id}`}
        passHref
        style={{ textDecoration: "none" }}
      >
        <CardImage>
          <Image
            src={anime.image || "/images/image_not_available.webp"}
            alt={anime.title}
            layout="fill"
            objectFit="cover"
            priority={false}
          />

          {anime.score && (
            <ScoreChip>
              <StarIcon sx={{ fontSize: 14, mr: 0.5, color: "gold" }} />
              {anime.score}
            </ScoreChip>
          )}

          {anime.type && !compact && (
            <TypeChip label={anime.type} size="small" />
          )}

          <GradientOverlay />

          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              right: 8,
              zIndex: 2,
              display: !compact ? "block" : "none",
            }}
          >
            <Typography
              variant="subtitle1"
              component="h3"
              fontWeight="medium"
              noWrap
              sx={{ color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
            >
              {anime.title}
            </Typography>

            {anime.status && (
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  opacity: 0.9,
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {anime.status} • {anime.episodes || "?"} ep
              </Typography>
            )}
          </Box>
        </CardImage>
      </Link>

      <CardContent>
        {compact && (
          <Typography
            variant="subtitle1"
            component="h3"
            fontWeight="medium"
            gutterBottom
            noWrap
            title={anime.title}
          >
            {anime.title}
          </Typography>
        )}

        {!compact && (
          <>
            {anime.genres && anime.genres.length > 0 && (
              <Box sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {anime.genres.slice(0, 2).map((genre, idx) => (
                  <Chip
                    key={idx}
                    label={genre}
                    size="small"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                ))}
                {anime.genres.length > 2 && (
                  <Typography
                    variant="caption"
                    sx={{ alignSelf: "center", color: "text.secondary" }}
                  >
                    +{anime.genres.length - 2} more
                  </Typography>
                )}
              </Box>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                mb: 1,
              }}
            >
              {anime.synopsis
                ? anime.synopsis.length > 100
                  ? anime.synopsis.substring(0, 100) + "..."
                  : anime.synopsis
                : "No synopsis available."}
            </Typography>

            <ActionRow>
              <Stack direction="row" spacing={1}>
                {onFavorite && (
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={onFavorite}
                  >
                    <FavoriteBorderIcon fontSize="small" />
                  </IconButton>
                )}
                {onWatchlist && (
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={onWatchlist}
                  >
                    <BookmarkBorderIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {anime.aired?.split(" to ")[0]}
              </Typography>
            </ActionRow>
          </>
        )}

        {compact && anime.status && (
          <Typography variant="caption" color="text.secondary" component="div">
            {anime.status} • {anime.episodes || "?"} ep
          </Typography>
        )}
      </CardContent>
    </CardContainer>
  );
};

export default AnimeDetailCard;
