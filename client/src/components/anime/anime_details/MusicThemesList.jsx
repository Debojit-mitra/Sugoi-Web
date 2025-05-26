import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import HeadphonesIcon from "@mui/icons-material/Headphones";

const ThemeItem = styled(ListItem)(({ theme, mobileView }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  paddingTop: theme.spacing(mobileView ? 1.5 : 2),
  paddingBottom: theme.spacing(mobileView ? 1.5 : 2),
}));

const MusicServiceButton = styled(Button)(({ theme, mobileView }) => ({
  marginTop: theme.spacing(1),
  marginRight: theme.spacing(1),
  fontSize: mobileView ? "0.7rem" : "0.75rem",
  padding: mobileView ? "4px 8px" : undefined,
}));

const EpisodeChip = styled(Chip)(({ theme, mobileView }) => ({
  marginTop: theme.spacing(0.5),
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
  fontSize: mobileView ? "0.65rem" : "0.7rem",
  height: mobileView ? "22px" : undefined,
}));

const ThemeIcon = styled(MusicNoteIcon)(({ theme, type, mobileView }) => ({
  marginRight: theme.spacing(mobileView ? 0.5 : 1),
  color:
    type === "opening"
      ? theme.palette.secondary.main
      : theme.palette.primary.main,
  fontSize: mobileView ? "1rem" : "1.2rem",
}));

const MusicThemesList = ({
  musicThemes,
  compact = false,
  mobileView = false,
}) => {
  if (
    !musicThemes ||
    (!musicThemes.opening?.length && !musicThemes.ending?.length)
  ) {
    return (
      <Typography variant="body1" align="center" sx={{ py: 3 }}>
        No music information available.
      </Typography>
    );
  }

  const renderTheme = (theme, index, type) => (
    <React.Fragment key={`${type}-${index}`}>
      {index > 0 && <Divider />}
      <ThemeItem mobileView={mobileView}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ThemeIcon type={type} mobileView={mobileView} />
          <Typography
            variant={mobileView ? "subtitle2" : "subtitle1"}
            component="div"
            noWrap
            sx={{ flex: 1 }}
          >
            {theme.title}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: mobileView ? "0.75rem" : undefined }}
        >
          by {theme.artist}
        </Typography>

        {theme.episodes && (
          <EpisodeChip
            size="small"
            label={`Episodes: ${theme.episodes}`}
            icon={<HeadphonesIcon fontSize={mobileView ? "0.7rem" : "small"} />}
            mobileView={mobileView}
          />
        )}

        {!compact &&
          theme.platforms &&
          Object.keys(theme.platforms).length > 0 && (
            <Stack
              direction="row"
              spacing={mobileView ? 0.5 : 1}
              sx={{ mt: 1, flexWrap: "wrap", gap: mobileView ? 0.5 : 1 }}
            >
              {theme.platforms.spotify && (
                <MusicServiceButton
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => window.open(theme.platforms.spotify, "_blank")}
                  mobileView={mobileView}
                >
                  Spotify
                </MusicServiceButton>
              )}
              {theme.platforms.apple && (
                <MusicServiceButton
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => window.open(theme.platforms.apple, "_blank")}
                >
                  Apple Music
                </MusicServiceButton>
              )}
              {theme.platforms.amazon && (
                <MusicServiceButton
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={() => window.open(theme.platforms.amazon, "_blank")}
                >
                  Amazon Music
                </MusicServiceButton>
              )}
            </Stack>
          )}
      </ThemeItem>
    </React.Fragment>
  );

  return (
    <Box>
      {musicThemes.opening?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              borderLeft: "4px solid",
              borderColor: "secondary.main",
              pl: 1,
            }}
          >
            Opening Theme{musicThemes.opening.length > 1 ? "s" : ""}
          </Typography>
          <List disablePadding>
            {musicThemes.opening.map((theme, idx) =>
              renderTheme(theme, idx, "opening")
            )}
          </List>
        </Box>
      )}

      {musicThemes.ending?.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ borderLeft: "4px solid", borderColor: "primary.main", pl: 1 }}
          >
            Ending Theme{musicThemes.ending.length > 1 ? "s" : ""}
          </Typography>
          <List disablePadding>
            {musicThemes.ending.map((theme, idx) =>
              renderTheme(theme, idx, "ending")
            )}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default MusicThemesList;
