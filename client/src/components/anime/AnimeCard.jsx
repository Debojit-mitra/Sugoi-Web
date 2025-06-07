import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Rating,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Bookmark as BookmarkIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useState } from "react";

const AnimeCard = ({
  anime,
  showActions = true,
  variant = "poster", // 'poster', 'horizontal', 'grid'
  showRank = false,
  rank = null,
  minHeight,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle navigation to anime details
  const handleClick = () => {
    router.push(`/anime/${anime.id}`);
  };

  // Handle opening the action menu
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the action menu
  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  // Determine if it's a horizontal card layout
  const isHorizontal = variant === "horizontal";

  // Basic anime card layout for poster
  const posterCardLayout = (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        minHeight: minHeight || "auto",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: `0 12px 20px ${alpha(theme.palette.common.black, 0.2)}`,
          "& .anime-card-actions": {
            opacity: 1,
          },
        },
      }}
      elevation={3}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Rank badge for top anime */}
        {showRank && rank !== null && (
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
            #{rank}
          </Box>
        )}

        {/* Score badge */}
        {anime.score && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              {anime.score}
            </Typography>
          </Box>
        )}

        {/* Image */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            pb: "150%" /* 2:3 aspect ratio */,
          }}
        >
          <CardMedia
            component="img"
            image={anime.imageUrl || "/images/placeholder.jpg"}
            alt={anime.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Overlay Actions */}
          {showActions && (
            <Box
              className="anime-card-actions"
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: "rgba(0, 0, 0, 0.7)",
                p: 1,
                display: "flex",
                justifyContent: "space-between",
                opacity: 0,
                transition: "opacity 0.3s ease",
              }}
            >
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  // Play/Watch action
                  handleClick();
                }}
              >
                <PlayArrowIcon />
              </IconButton>

              {isAuthenticated && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to watchlist action
                    //console.log("Add to watchlist:", anime.title);
                  }}
                >
                  <AddIcon />
                </IconButton>
              )}

              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ color: "white" }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1, pb: 2 }}>
          <Typography
            variant="body1"
            component="h3"
            className="text-truncate-2"
            fontWeight="medium"
            sx={{ mb: 1, lineHeight: 1.3 }}
          >
            {anime.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            {/* Type & Episodes */}
            <Box>
              {anime.type && (
                <Typography variant="caption" color="text.secondary">
                  {anime.type} {anime.episodes && `(${anime.episodes} eps)`}
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

      {/* Action Menu */}
      <Menu
        id={`anime-menu-${anime.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={(e) => {
            handleMenuClose(e);
            handleClick();
          }}
        >
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {isAuthenticated && (
          <>
            <MenuItem
              onClick={(e) => {
                handleMenuClose(e);
              }}
            >
              <ListItemIcon>
                <BookmarkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add to Watchlist</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleMenuClose(e);
              }}
            >
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark as Completed</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Card>
  );

  // Horizontal card layout (for lists or search results)
  const horizontalCardLayout = (
    <Card
      sx={{
        display: "flex",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.2)}`,
        },
        height: "100%",
        minHeight: minHeight || 150,
      }}
      elevation={2}
    >
      <CardActionArea
        sx={{
          display: "flex",
          alignItems: "stretch",
          height: "100%",
          justifyContent: "flex-start",
        }}
        onClick={handleClick}
      >
        {/* Rank badge */}
        {showRank && rank !== null && (
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
            #{rank}
          </Box>
        )}

        {/* Image */}
        <Box
          sx={{
            width: 100,
            flexShrink: 0,
            position: "relative",
            display: "flex",
          }}
        >
          <CardMedia
            component="img"
            image={anime.imageUrl || "/images/placeholder.jpg"}
            alt={anime.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{ flex: 1, py: 1.5, px: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography
              variant="subtitle1"
              component="h3"
              fontWeight="medium"
              className="text-truncate-2"
              sx={{ mb: 0.5, pr: 2 }}
            >
              {anime.title}
            </Typography>

            {anime.score && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: "auto",
                  flexShrink: 0,
                }}
              >
                <StarIcon
                  sx={{ color: "warning.main", fontSize: "0.9rem", mr: 0.5 }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {anime.score}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {anime.type && (
              <Chip
                label={anime.type}
                size="small"
                sx={{ height: 20, fontSize: "0.625rem" }}
              />
            )}

            {anime.episodes && (
              <Chip
                label={`${anime.episodes} eps`}
                size="small"
                sx={{ height: 20, fontSize: "0.625rem" }}
              />
            )}

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

          {anime.synopsis && (
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-truncate-3"
              sx={{ mt: 1, fontSize: "0.8rem" }}
            >
              {anime.synopsis}
            </Typography>
          )}
        </CardContent>

        {/* Actions */}
        {showActions && isAuthenticated && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 1,
              borderLeft: `1px solid ${theme.palette.divider}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              color="primary"
              size="small"
              sx={{ mb: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                // Add to watchlist action
                //console.log("Add to watchlist:", anime.title);
              }}
            >
              <AddIcon />
            </IconButton>

            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
      </CardActionArea>

      {/* Action Menu */}
      <Menu
        id={`anime-menu-${anime.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={(e) => {
            handleMenuClose(e);
            handleClick();
          }}
        >
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {isAuthenticated && (
          <>
            <MenuItem
              onClick={(e) => {
                handleMenuClose(e);
              }}
            >
              <ListItemIcon>
                <BookmarkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add to Watchlist</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                handleMenuClose(e);
              }}
            >
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark as Completed</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Card>
  );

  // Return the appropriate card layout based on the variant
  if (isHorizontal) {
    return horizontalCardLayout;
  }

  return posterCardLayout;
};

export default AnimeCard;
