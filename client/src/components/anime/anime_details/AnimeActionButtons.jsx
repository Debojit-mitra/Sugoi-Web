import React from "react";
import {
  Box,
  Button,
  Fab,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/Share";

// Styled components
const BorderedIconButton = styled(IconButton)(({ theme, active }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,

  padding: theme.spacing(0.8),
  display: "flex",
  alignItems: "center",
  backgroundColor: active
    ? theme.palette[active ? "action.selected" : "background.paper"]
    : "transparent",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5),
  },
}));

const ButtonText = styled(Typography)(({ theme, variant }) => ({
  marginLeft: theme.spacing(1),
  fontSize: variant === "mobile" ? "0.75rem" : "0.85rem",
  fontWeight: 500,
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.75rem",
  },
}));

const MainActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: theme.shape.borderRadius,
  fontWeight: 600,
  fontSize: variant === "mobile" ? "0.85rem" : "1rem",
  padding:
    variant === "mobile" ? theme.spacing(0.5, 1.5) : theme.spacing(0.7, 3),
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.85rem",
    padding: theme.spacing(1.5, 1.2),
  },
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: "fixed",
  right: theme.spacing(3),
  bottom: theme.spacing(3),
  zIndex: 1000,
}));

const AnimeActionButtons = ({
  onPlay,
  onAddToList,
  onLike,
  onFavorite,
  onShare,
  isFavorite = false,
  isInList = false,
  isLiked = false,
  floatingPlay = false,
  variant = "desktop", // 'desktop', 'mobile', 'floating'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCompact = variant === "mobile" || isMobile;

  // Floating play button (for mobile view)
  if (floatingPlay && onPlay) {
    return (
      <FloatingActionButton
        color="secondary"
        aria-label="play"
        onClick={onPlay}
        size={isCompact ? "medium" : "large"}
      >
        <PlayArrowIcon />
      </FloatingActionButton>
    );
  }

  // Main action bar
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isCompact ? 2 : 2,
        flexWrap: "wrap",
        width: variant === "mobile" ? "100%" : "auto",
        justifyContent: variant === "mobile" ? "center" : "flex-start",
      }}
    >
      {onPlay && (
        <MainActionButton
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onPlay}
          fullWidth={variant === "mobile"}
          size={isCompact ? "small" : "medium"}
          sx={{
            variant: variant,
          }}
        >
          Watch Now
        </MainActionButton>
      )}

      {onAddToList && (
        <Tooltip title={isInList ? "Remove from list" : "Add to watchlist"}>
          <BorderedIconButton
            color={isInList ? "primary" : "default"}
            onClick={onAddToList}
            size={isCompact ? "small" : "medium"}
            active={isInList}
            aria-label={isInList ? "Remove from list" : "Add to watchlist"}
            sx={{
              borderColor: isInList
                ? theme.palette.primary.main
                : theme.palette.divider,
            }}
          >
            {isInList ? <BookmarkIcon color="primary" /> : <BookmarkAddIcon />}
            {!isCompact && (
              <ButtonText
                variant={variant}
                color={isInList ? "primary" : "textPrimary"}
              >
                {isInList ? "In List" : "Add to List"}
              </ButtonText>
            )}
          </BorderedIconButton>
        </Tooltip>
      )}

      {onFavorite && (
        <Tooltip
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <BorderedIconButton
            color={isFavorite ? "secondary" : "default"}
            onClick={onFavorite}
            size={isCompact ? "small" : "medium"}
            active={isFavorite}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            sx={{
              borderColor: isFavorite
                ? theme.palette.secondary.main
                : theme.palette.divider,
            }}
          >
            <FavoriteIcon color={isFavorite ? "secondary" : "action"} />
            {!isCompact && (
              <ButtonText
                variant={variant}
                color={isFavorite ? "secondary" : "textPrimary"}
              >
                {isFavorite ? "Favorited" : "Favorite"}
              </ButtonText>
            )}
          </BorderedIconButton>
        </Tooltip>
      )}

      {onLike && (
        <Tooltip title={isLiked ? "Unlike" : "Like"}>
          <BorderedIconButton
            color={isLiked ? "info" : "default"}
            onClick={onLike}
            size={isCompact ? "small" : "medium"}
            active={isLiked}
            aria-label={isLiked ? "Unlike" : "Like"}
            sx={{
              borderColor: isLiked
                ? theme.palette.info.main
                : theme.palette.divider,
            }}
          >
            <ThumbUpIcon color={isLiked ? "info" : "action"} />
            {!isCompact && (
              <ButtonText
                variant={variant}
                color={isLiked ? "info" : "textPrimary"}
              >
                {isLiked ? "Liked" : "Like"}
              </ButtonText>
            )}
          </BorderedIconButton>
        </Tooltip>
      )}

      {onShare && (
        <Tooltip title="Share">
          <BorderedIconButton
            color="default"
            onClick={onShare}
            size={isCompact ? "small" : "medium"}
            aria-label="Share"
          >
            <ShareIcon />
            {!isCompact && <ButtonText variant={variant}>Share</ButtonText>}
          </BorderedIconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default AnimeActionButtons;
