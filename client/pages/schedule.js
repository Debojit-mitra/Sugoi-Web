import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  useTheme,
  Chip,
} from "@mui/material";
import { fetchSchedule } from "../src/redux/slices/animeSlice";
import SeasonalAnimeGrid from "../src/components/anime/SeasonalAnimeGrid";
import SkeletonAnimeGrid from "../src/components/anime/SkeletonAnimeGrid";

// Define days of the week
const DAYS = {
  ALL: "All",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
  OTHER: "Other",
  UNKNOWN: "Unknown",
};

const SchedulePage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Get data from Redux
  const { scheduleData, isLoading, error } = useSelector(
    (state) => state.anime
  );

  // Local state
  const [activeTab, setActiveTab] = useState(0);

  // Fetch schedule data on component mount
  useEffect(() => {
    dispatch(fetchSchedule());
  }, [dispatch]);

  // // Debug: Log current schedule data when it changes
  // useEffect(() => {
  //   if (scheduleData) {
  //     console.log("Schedule data in component:", scheduleData);
  //   }
  // }, [scheduleData]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter anime by day based on active tab
  const getFilteredAnime = () => {
    if (!scheduleData) {
      return [];
    }

    const tabKeys = Object.keys(DAYS);
    const selectedDay = tabKeys[activeTab];
    const selectedDayValue = DAYS[selectedDay];

    // If scheduleData is an object with day keys (most likely case)
    if (typeof scheduleData === "object" && !Array.isArray(scheduleData)) {
      if (selectedDay === "ALL") {
        // Combine all days into one array
        return Object.values(scheduleData).flat();
      }

      // Return the array for the specific day or empty array if it doesn't exist
      return scheduleData[selectedDayValue] || [];
    }

    // If scheduleData is an array (fallback)
    else {
      if (selectedDay === "ALL") {
        return scheduleData;
      }

      // Filter based on broadcast day
      if (selectedDay === "OTHER") {
        return scheduleData.filter(
          (anime) =>
            anime.broadcast?.day &&
            !Object.values(DAYS)
              .slice(1, 9)
              .map((day) => day.toLowerCase())
              .includes(anime.broadcast.day.toLowerCase())
        );
      }

      if (selectedDay === "UNKNOWN") {
        return scheduleData.filter((anime) => !anime.broadcast?.day);
      }

      return scheduleData.filter(
        (anime) =>
          anime.broadcast?.day &&
          anime.broadcast.day.toLowerCase() === selectedDayValue.toLowerCase()
      );
    }
  };

  // Count anime per day for displaying in tabs
  const getAnimeCountByDay = (day) => {
    if (!scheduleData) return 0;

    // If scheduleData is an object with day keys (most likely case)
    if (typeof scheduleData === "object" && !Array.isArray(scheduleData)) {
      if (day === "All") {
        // Sum the length of all arrays
        return Object.values(scheduleData).reduce(
          (total, animeList) => total + (animeList?.length || 0),
          0
        );
      }

      // Return the length of the array for the specific day or 0 if it doesn't exist
      return scheduleData[day]?.length || 0;
    }

    // If scheduleData is an array (fallback)
    else {
      if (scheduleData.length === 0) return 0;

      if (day === "All") {
        return scheduleData.length;
      }

      if (day === "Other") {
        return scheduleData.filter(
          (anime) =>
            anime.broadcast?.day &&
            !Object.values(DAYS)
              .slice(1, 9)
              .map((d) => d.toLowerCase())
              .includes(anime.broadcast.day.toLowerCase())
        ).length;
      }

      if (day === "Unknown") {
        return scheduleData.filter((anime) => !anime.broadcast?.day).length;
      }

      return scheduleData.filter(
        (anime) =>
          anime.broadcast?.day &&
          anime.broadcast.day.toLowerCase() === day.toLowerCase()
      ).length;
    }
  };

  return (
    <>
      <Head>
        <title>Anime Schedule | Sugoi Web</title>
        <meta
          name="description"
          content="Browse weekly anime broadcast schedule"
        />
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
              Anime Schedule
            </Typography>
            <Typography variant="body1" color="common.white">
              Browse anime releases by day of the week
            </Typography>
          </Box>
        </Box>

        {/* Day Filter Tabs */}
        <Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="common.white"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "medium",
                fontSize: "0.95rem",
                py: 2,
                color: "common.white",
              },
            }}
          >
            {Object.entries(DAYS).map(([key, day], index) => (
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {day}
                    <Chip
                      size="small"
                      label={getAnimeCountByDay(day)}
                      color={activeTab === index ? "primary" : "default"}
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>
                }
                key={index}
                sx={{
                  minWidth: day === "Wednesday" ? 120 : 100,
                }}
              />
            ))}
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
            <Box
              sx={{
                mt: 2,
                mb: 2,
              }}
            />
            {/* Display anime grid */}
            <SeasonalAnimeGrid animeList={getFilteredAnime()} />
          </>
        )}
      </Container>
    </>
  );
};

export default SchedulePage;
