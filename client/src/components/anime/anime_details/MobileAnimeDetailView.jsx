import React from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  Rating,
  IconButton,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import TrailerPlayer from "./TrailerPlayer";
import CharactersList from "./CharactersList";
import RelatedAnimeList from "./RelatedAnimeList";
import MusicThemesList from "./MusicThemesList";
import RecommendationsList from "./RecommendationsList";
import AnimeActionButtons from "./AnimeActionButtons";

const ContentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 40, 0.9)"
      : "rgba(255, 255, 255, 0.95)",
}));

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconFilled": {
    color: theme.palette.secondary.main,
  },
}));

const MobileAnimeDetailView = ({
  animeDetails,
  favorite,
  watchlist,
  toggleFavorite,
  toggleWatchlist,
  tabValue,
  handleTabChange,
  NOT_AVAILABLE_IMAGE,
}) => {
  const [showFullSynopsis, setShowFullSynopsis] = React.useState(false);

  const toggleSynopsis = () => {
    setShowFullSynopsis(!showFullSynopsis);
  };

  // Details content to be displayed above synopsis
  const detailsContent = (
    <Box
      sx={{
        mt: 2,
        mb: 2,
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        Anime Details
      </Typography>
      <List dense disablePadding>
        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            Status
          </Typography>
          <Typography component="span" variant="body2">
            {animeDetails.status || "Unknown"}
          </Typography>
        </ListItem>

        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            Type
          </Typography>
          <Typography component="span" variant="body2">
            {animeDetails.type || "Unknown"}
          </Typography>
        </ListItem>

        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            Episodes
          </Typography>
          <Typography component="span" variant="body2">
            {animeDetails.episodes || "?"}
          </Typography>
        </ListItem>

        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            Duration
          </Typography>
          <Typography component="span" variant="body2">
            {animeDetails.duration || "Unknown"}
          </Typography>
        </ListItem>

        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            Aired
          </Typography>
          <Typography component="span" variant="body2">
            {animeDetails.aired || "Unknown"}
          </Typography>
        </ListItem>

        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 0,
          }}
        >
          <Typography
            component="div"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            Studios
          </Typography>
          <Typography component="span" variant="body2">
            {animeDetails.studios
              ? Object.keys(animeDetails.studios).join(", ")
              : "Unknown"}
          </Typography>
        </ListItem>

        {animeDetails.rating && (
          <>
            <ListItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 0,
              }}
            >
              <Typography
                component="div"
                variant="body2"
                sx={{ fontWeight: "medium" }}
              >
                Rating
              </Typography>
              <Typography component="span" variant="body2">
                {animeDetails.rating || "Unknown"}
              </Typography>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ mt: 25, mb: 4, position: "relative", zIndex: 2 }}>
      {/* Main Header with Image and Title Section */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Box sx={{ display: "flex", mb: 2 }}>
          <Box
            sx={{
              width: "40%",
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 3,
            }}
          >
            {animeDetails.image ? (
              <Image
                src={animeDetails.image}
                alt={animeDetails.title}
                width={150}
                height={225}
                layout="responsive"
                priority
              />
            ) : (
              <Box
                sx={{
                  bgcolor: "grey.300",
                  height: 225,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2">Image not available</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ pl: 2, width: "60%" }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {animeDetails.title}
            </Typography>
            {animeDetails.englishTitle && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {animeDetails.englishTitle}
              </Typography>
            )}
            <Box sx={{ my: 1 }}>
              <StyledRating
                value={
                  animeDetails.score ? parseFloat(animeDetails.score / 2) : 0
                }
                precision={0.5}
                readOnly
                size="small"
              />
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {animeDetails.score} / 10
              </Typography>
            </Box>

            {/* Action Buttons Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <IconButton
                onClick={toggleFavorite}
                color={favorite ? "secondary" : "default"}
                size="small"
              >
                {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton
                onClick={toggleWatchlist}
                color={watchlist ? "primary" : "default"}
                size="small"
              >
                {watchlist ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Genres Tags */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            my: 1,
          }}
        >
          {animeDetails.genres &&
            animeDetails.genres.map((genre, idx) => (
              <Chip
                key={idx}
                label={genre}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            ))}
          {animeDetails.themes &&
            animeDetails.themes.map((theme, idx) => (
              <Chip
                key={idx}
                label={theme}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            ))}
        </Box>

        {/* Anime Details - Now shown above the synopsis */}
        {detailsContent}

        {/* Synopsis (with Show More functionality) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Synopsis
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "justify",
              display: showFullSynopsis ? "block" : "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 4,
              overflow: showFullSynopsis ? "visible" : "hidden",
              mb: 1,
            }}
          >
            {animeDetails.synopsis || "No synopsis available."}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={toggleSynopsis}
            endIcon={
              showFullSynopsis ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )
            }
            sx={{ mt: 0.5, boxShadow: 0 }}
          >
            {showFullSynopsis ? "Show Less" : "Show More"}
          </Button>
        </Box>

        {/* Action Buttons for watching, adding to list */}
        <Box sx={{ mt: 2 }}>
          <AnimeActionButtons onPlay={() => ""} variant="mobile" />
        </Box>
      </Box>

      {/* Content Tabs */}
      <ContentCard>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="anime content tabs"
        >
          <Tab label="Trailer" sx={{ fontSize: "0.875rem" }} />
          <Tab label="Characters" sx={{ fontSize: "0.875rem" }} />
          <Tab label="Related" sx={{ fontSize: "0.875rem" }} />
          <Tab label="Music" sx={{ fontSize: "0.875rem" }} />
        </Tabs>

        {/* Trailer Tab */}
        <Box hidden={tabValue !== 0} sx={{ mt: 2 }}>
          {animeDetails.trailerUrlYoutube ? (
            <TrailerPlayer
              trailerUrl={animeDetails.trailerUrlYoutube}
              title={animeDetails.title}
            />
          ) : (
            <Typography variant="body2" align="center" sx={{ py: 3 }}>
              No trailer available for this anime.
            </Typography>
          )}
        </Box>

        {/* Characters Tab */}
        <Box hidden={tabValue !== 1} sx={{ mt: 2 }}>
          <CharactersList
            characters={animeDetails.characters}
            limit={12}
            mobileView={true}
          />
        </Box>

        {/* Related Anime Tab */}
        <Box hidden={tabValue !== 2} sx={{ mt: 2 }}>
          <RelatedAnimeList
            relatedEntries={animeDetails.relatedEntries}
            mobileView={true}
          />
        </Box>

        {/* Music Tab */}
        <Box hidden={tabValue !== 3} sx={{ mt: 2 }}>
          <MusicThemesList
            musicThemes={animeDetails.musicThemes}
            mobileView={true}
          />
        </Box>
      </ContentCard>

      {/* Recommendations */}
      {animeDetails.recommendations?.length > 0 && (
        <ContentCard sx={{ px: 2 }}>
          <RecommendationsList
            recommendations={animeDetails.recommendations}
            mobileView={true}
          />
        </ContentCard>
      )}
    </Box>
  );
};

export default MobileAnimeDetailView;
