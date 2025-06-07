import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  useTheme,
  Paper,
  Chip,
} from "@mui/material";
import {
  fetchCurrentSeason,
  fetchSeason,
} from "../src/redux/slices/animeSlice";
import SeasonalAnimeGrid from "../src/components/anime/SeasonalAnimeGrid";
import SkeletonAnimeGrid from "../src/components/anime/SkeletonAnimeGrid";
import {
  getCurrentSeason,
  getSeasonName,
  getYearRange,
  filterAnimeByType,
} from "../src/utils/seasonUtils";

// Define anime type categories
const ANIME_TYPES = {
  TV_NEW: "TV (New)",
  TV_CONTINUING: "TV (Continuing)",
  ONA: "ONA",
  OVA: "OVA",
  MOVIE: "Movie",
  SPECIAL: "Special",
};

const SeasonalPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Get data from Redux
  const { currentSeason, isLoading, error } = useSelector(
    (state) => state.anime
  );

  // Local state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
  const [activeTab, setActiveTab] = useState(0);
  const [availableYears, setAvailableYears] = useState(getYearRange(2000));
  const [isCurrentSeason, setIsCurrentSeason] = useState(true);

  // Get current year and season on component mount
  useEffect(() => {
    // Fetch current season data on initial load
    dispatch(fetchCurrentSeason());
  }, [dispatch]);

  // Handle year change
  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setSelectedYear(newYear);

    // Check if this is the current season
    const currentYear = new Date().getFullYear();
    const currentSeasonName = getCurrentSeason();
    setIsCurrentSeason(
      newYear === currentYear && selectedSeason === currentSeasonName
    );

    dispatch(fetchSeason({ year: newYear, season: selectedSeason }));
  };

  // Handle season change
  const handleSeasonChange = (event) => {
    const newSeason = event.target.value;
    setSelectedSeason(newSeason);

    // Check if this is the current season
    const currentYear = new Date().getFullYear();
    const currentSeasonName = getCurrentSeason();
    setIsCurrentSeason(
      selectedYear === currentYear && newSeason === currentSeasonName
    );

    dispatch(fetchSeason({ year: selectedYear, season: newSeason }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter anime by type based on active tab
  const getFilteredAnime = () => {
    if (!currentSeason) {
      return [];
    }

    // Log the current season data to help debug
    //console.log("Current Season Data:", currentSeason);

    const tabKeys = Object.keys(ANIME_TYPES);
    const selectedType = tabKeys[activeTab];

    // The API returns data already categorized by type
    switch (selectedType) {
      case "TV_NEW":
        return currentSeason["TV (New)"] || [];
      case "TV_CONTINUING":
        return currentSeason["TV (Continuing)"] || [];
      case "ONA":
        return currentSeason["ONA"] || [];
      case "OVA":
        return currentSeason["OVA"] || [];
      case "MOVIE":
        return currentSeason["Movie"] || [];
      case "SPECIAL":
        return currentSeason["Special"] || [];
      default:
        return [];
    }
  };

  return (
    <>
      <Head>
        <title>
          {isCurrentSeason
            ? `Current Season Anime | Sugoi Web`
            : `${getSeasonName(
                selectedSeason
              )} ${selectedYear} Anime | Sugoi Web`}
        </title>
        <meta name="description" content="Browse seasonal anime releases" />
      </Head>

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "70vh", // only 30% of the viewport height
          zIndex: 0,
          overflow: "hidden", // prevent overflow
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? `linear-gradient(0deg,
                    ${theme.palette.common.black} 0%,
                    rgb(0, 0, 0) 10%,
                    rgba(0,0,0,0.7) 25%,
                    rgba(0,0,0,0.55) 40%,
                    rgba(0,0,0,0.4) 55%,
                    rgba(0,0,0,0.25) 70%,
                    rgba(0,0,0,0.15) 85%,
                    rgba(0,0,0,0.05) 100%)`
                : `linear-gradient(0deg,
                    ${theme.palette.common.white} 0%,
                    rgba(245,245,245,0.65) 10%,
                    rgba(245,245,245,0.5) 25%,
                    rgba(245,245,245,0.4) 40%,
                    rgba(245,245,245,0.3) 55%,
                    rgba(245,245,245,0.2) 70%,
                    rgba(245,245,245,0.1) 85%,
                    rgba(245,245,245,0.05) 100%)`,
            zIndex: 1,
          },
        }}
      >
        <Box
          component="img"
          src="/images/login.webp"
          alt={"a"}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(8px)",
            transform: "scale(1.1)",
            transition: "transform 0.5s ease",
          }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            mb: 2,
            mt: 8,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="common.white"
            >
              Seasonal Anime
            </Typography>
            <Typography variant="body1" color="common.white">
              Explore anime releases by season and year
            </Typography>
          </Box>
        </Box>

        {/* Season and Year Selection */}
        <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
          <Grid size={{ xs: 4.5, md: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="year-select-label">Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear}
                onChange={handleYearChange}
                label="Year"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      "&::-webkit-scrollbar": {
                        width: "5px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.purple["A200"],
                        borderRadius: "2px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: theme.palette.purple["A200"],
                      },
                    },
                  },
                }}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 7.5, md: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="season-select-label">Season</InputLabel>
              <Select
                labelId="season-select-label"
                id="season-select"
                value={selectedSeason}
                onChange={handleSeasonChange}
                label="Season"
              >
                <MenuItem value="winter">Winter (Jan-Mar)</MenuItem>
                <MenuItem value="spring">Spring (Apr-Jun)</MenuItem>
                <MenuItem value="summer">Summer (Jul-Sep)</MenuItem>
                <MenuItem value="fall">Fall (Oct-Dec)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Type Filter Tabs */}
        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "medium",
                fontSize: "0.95rem",
                py: 2,
              },
            }}
          >
            {Object.entries(ANIME_TYPES).map(([key, type], index) => {
              // Get count of anime for this type
              const count =
                currentSeason && currentSeason[type]
                  ? currentSeason[type].length
                  : 0;
              return (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{type}</span>
                      <Chip
                        label={count}
                        size="small"
                        color={activeTab === index ? "primary" : "default"}
                        sx={{
                          height: "20px",
                          minWidth: "28px",
                          fontSize: "0.75rem",
                        }}
                      />
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Loading state */}
        {isLoading ? (
          <Box sx={{ py: 2 }}>
            <SkeletonAnimeGrid count={12} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Heading for filtered results */}
            <Box
              sx={{
                mt: 2,
                mb: 2,
              }}
            />

            <SeasonalAnimeGrid animeList={getFilteredAnime()} />
          </>
        )}
      </Container>
    </>
  );
};

export default SeasonalPage;
