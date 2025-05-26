import React, { useState } from "react";
import { Box, useMediaQuery, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useTheme } from "@mui/material/styles";

const TrailerContainer = styled(Box)(({ theme, isMobile }) => ({
  padding: isMobile ? theme.spacing(1) : theme.spacing(2),
  marginBottom: isMobile ? theme.spacing(2) : theme.spacing(3),
}));

const TrailerWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  paddingTop: "56.25%", // 16:9 Aspect Ratio
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  cursor: "pointer",
}));

const TrailerFrame = styled("iframe")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: "100%",
  height: "100%",
  border: "none",
}));

const ThumbnailImage = styled("img")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: theme.shape.borderRadius,
}));

const PlayButtonOverlay = styled(Box)(({ theme, isMobile }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(0, 0, 0, 0.3)",
  borderRadius: theme.shape.borderRadius,
  transition: "background 0.2s ease",
  "&:hover": {
    background: "rgba(0, 0, 0, 0.5)",
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "rgba(0, 0, 0, 0.5)",
  borderRadius: theme.shape.borderRadius,
  zIndex: 1,
}));

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const TrailerPlayer = ({ trailerUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!trailerUrl) return null;

  const videoId = extractYouTubeId(trailerUrl);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  const handleThumbnailError = (e) => {
    e.target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
    setIsLoading(true); // Start loading
  };

  const handleIframeLoad = () => {
    setIsLoading(false); // End loading
  };

  return (
    <TrailerContainer isMobile={isMobile}>
      <TrailerWrapper onClick={!isPlaying ? handlePlayClick : undefined}>
        {!isPlaying ? (
          <>
            {thumbnailUrl && (
              <ThumbnailImage
                src={thumbnailUrl}
                alt={`${title || "Anime"} Trailer Thumbnail`}
                onError={handleThumbnailError}
              />
            )}
            <PlayButtonOverlay isMobile={isMobile}>
              <YouTubeIcon
                sx={{ color: "red", fontSize: isMobile ? "3rem" : "4rem" }}
              />
            </PlayButtonOverlay>
          </>
        ) : (
          <>
            {isLoading && (
              <LoadingOverlay>
                <CircularProgress color="inherit" />
              </LoadingOverlay>
            )}
            <TrailerFrame
              src={`${trailerUrl}${
                trailerUrl.includes("?") ? "&" : "?"
              }autoplay=1`}
              title={`${title || "Anime"} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </>
        )}
      </TrailerWrapper>
    </TrailerContainer>
  );
};

export default TrailerPlayer;
