import React from "react";
import { Box, Typography, Avatar, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";

const CharacterGrid = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(1),
  },
}));

const CharacterCard = styled(Box)(({ theme, mobileView }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: mobileView ? "100px" : "120px",
  position: "relative", // Add position relative here
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
  },
  [theme.breakpoints.down("sm")]: {
    width: "90px",
  },
}));

const CharacterAvatar = styled(Box)(({ theme, mobileView }) => ({
  width: mobileView ? "80px" : "100px",
  height: mobileView ? "80px" : "100px",
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: theme.spacing(1),
  border: `2px solid ${theme.palette.primary.main}`,
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    width: "70px",
    height: "70px",
  },
}));

const VoiceActorAvatar = styled(Avatar)(({ theme, mobileView }) => ({
  width: mobileView ? "30px" : "40px",
  height: mobileView ? "30px" : "40px",
  position: "absolute",
  top: mobileView ? "50px" : "60px", // Position at the top of the CharacterCard
  right: mobileView ? "25px" : "5px",
  border: `2px solid ${theme.palette.background.paper}`,
  zIndex: 1,
  [theme.breakpoints.down("sm")]: {
    width: "25px",
    height: "25px",
    top: "45px",
  },
}));

const CharactersList = ({ characters, limit = 15, mobileView = false }) => {
  if (!characters || characters.length === 0) {
    return (
      <Typography variant="body1" align="center" sx={{ py: 3 }}>
        No character information available.
      </Typography>
    );
  }

  // For mobile layout, use Grid system for better responsiveness
  if (mobileView) {
    return (
      <Grid container spacing={1}>
        {characters.slice(0, limit).map((character, index) => (
          <Grid size={{ xs: 4, sm: 3 }} key={index}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  mb: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CharacterAvatar mobileView={mobileView}>
                  <Image
                    src={
                      character.imageUrl || "/images/image_not_available.webp"
                    }
                    alt={character.name}
                    width={80}
                    height={80}
                    layout="responsive"
                  />
                </CharacterAvatar>

                {character.voiceActors &&
                  character.voiceActors[0]?.imageUrl && (
                    <VoiceActorAvatar mobileView={mobileView}>
                      <Image
                        src={character.voiceActors[0].imageUrl}
                        alt={character.voiceActors[0].name}
                        width={25}
                        height={25}
                        layout="responsive"
                      />
                    </VoiceActorAvatar>
                  )}
              </Box>

              <Typography
                variant="body2"
                align="center"
                noWrap
                sx={{
                  fontSize: "0.8rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {character.name}
              </Typography>

              <Typography
                variant="caption"
                align="center"
                color="text.secondary"
                sx={{ fontSize: "0.7rem" }}
              >
                {character.role}
              </Typography>
              {character.voiceActors && character.voiceActors[0] && (
                <Typography
                  variant="caption"
                  align="center"
                  color="text.secondary"
                  sx={{ fontSize: "0.65rem" }}
                >
                  {character.voiceActors[0].name}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Desktop layout
  return (
    <CharacterGrid>
      {characters.slice(0, limit).map((character, index) => (
        <CharacterCard key={index}>
          {character.voiceActors && character.voiceActors[0]?.imageUrl && (
            <VoiceActorAvatar>
              <Image
                src={character.voiceActors[0].imageUrl}
                alt={character.voiceActors[0].name}
                width={30}
                height={30}
                layout="responsive"
              />
            </VoiceActorAvatar>
          )}
          <CharacterAvatar>
            <Image
              src={character.imageUrl || "/images/image_not_available.webp"}
              alt={character.name}
              width={100}
              height={100}
              layout="responsive"
            />
          </CharacterAvatar>
          <Typography
            variant="body2"
            align="center"
            noWrap
            sx={{
              fontSize: "0.8rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {character.name}
          </Typography>

          <Typography variant="caption" align="center" color="text.secondary">
            {character.role}
          </Typography>
          {character.voiceActors && character.voiceActors[0] && (
            <Typography
              variant="caption"
              align="center"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              {character.voiceActors[0].name}
            </Typography>
          )}
        </CharacterCard>
      ))}
    </CharacterGrid>
  );
};

export default CharactersList;
