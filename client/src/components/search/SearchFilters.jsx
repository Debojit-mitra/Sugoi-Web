import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Paper,
  TextField,
  OutlinedInput,
  Checkbox,
  ListItemText,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  Divider,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import {
  setSearchFilter,
  resetSearchFilters,
} from "../../redux/slices/searchSlice";

// Constants for filter options
const TYPE_OPTIONS = [
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Special" },
  { value: "music", label: "Music" },
];

const STATUS_OPTIONS = [
  { value: "airing", label: "Airing" },
  { value: "complete", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

const GENRE_OPTIONS = [
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "fantasy", label: "Fantasy" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "slice of life", label: "Slice of Life" },
  { value: "sports", label: "Sports" },
  { value: "supernatural", label: "Supernatural" },
  { value: "suspense", label: "Suspense" },
  { value: "award winning", label: "Award Winning" },
];

const DEMOGRAPHIC_OPTIONS = [
  { value: "josei", label: "Josei" },
  { value: "kids", label: "Kids" },
  { value: "seinen", label: "Seinen" },
  { value: "shoujo", label: "Shoujo" },
  { value: "shounen", label: "Shounen" },
];

const SearchFilters = ({ onApplyFilters, onResetFilters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const activeFilters = useSelector((state) => state.search.activeFilters);

  const [expanded, setExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Use this to prevent hydration errors with date components
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(setSearchFilter({ filterName, value }));
  };

  const handleResetFilters = () => {
    dispatch(resetSearchFilters());
    if (onResetFilters) onResetFilters();
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) onApplyFilters(activeFilters);
  };

  const calculateActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.type) count++;
    if (activeFilters.score) count++;
    if (activeFilters.status) count++;
    if (activeFilters.genre && activeFilters.genre.length > 0) count++;
    if (activeFilters.demographic) count++;
    if (activeFilters.adult === false) count++; // Only count if explicitly set to false
    if (activeFilters.startDate) count++;
    if (activeFilters.endDate) count++;
    return count;
  };

  const activeFilterCount = calculateActiveFilterCount();

  // Render the mobile view of filters as an accordion
  if (isMobile) {
    return (
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          mt: 2,
          overflow: "hidden",
          bgcolor: "transparent",
          backdropFilter: "blur(8px)",
        }}
      >
        <Accordion
          expanded={expanded}
          onChange={handleToggleExpand}
          disableGutters
          sx={{
            boxShadow: "none",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 2, py: 1 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FilterIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="button">
                Filters
                {activeFilterCount > 0 && (
                  <Chip
                    size="small"
                    label={activeFilterCount}
                    color="primary"
                    sx={{ ml: 1, height: 20, fontSize: "0.75rem" }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
            <Grid container spacing={2}>
              {/* Type Filter */}
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={activeFilters.type || ""}
                    onChange={(e) =>
                      handleFilterChange("type", e.target.value || null)
                    }
                    label="Type"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={activeFilters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value || null)
                    }
                    label="Status"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Genre Filter */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Genres</InputLabel>
                  <Select
                    multiple
                    value={activeFilters.genre || []}
                    onChange={(e) =>
                      handleFilterChange("genre", e.target.value)
                    }
                    input={<OutlinedInput label="Genres" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={
                              GENRE_OPTIONS.find(
                                (option) => option.value === value
                              )?.label || value
                            }
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Checkbox
                          checked={
                            (activeFilters.genre || []).indexOf(option.value) >
                            -1
                          }
                        />
                        <ListItemText primary={option.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Demographic Filter */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Demographic</InputLabel>
                  <Select
                    value={activeFilters.demographic || ""}
                    onChange={(e) =>
                      handleFilterChange("demographic", e.target.value || null)
                    }
                    label="Demographic"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {DEMOGRAPHIC_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Score Filter */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Minimum Score: {activeFilters.score || "Any"}
                </Typography>
                <Slider
                  value={activeFilters.score || 0}
                  onChange={(_, value) =>
                    handleFilterChange("score", value === 0 ? null : value)
                  }
                  step={1}
                  marks
                  min={0}
                  max={10}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => (value === 0 ? "Any" : value)}
                />
              </Grid>

              {/* Date Filters */}
              <Grid size={{ xs: 12 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      {isClient ? (
                        <DatePicker
                          label="From Date"
                          value={
                            activeFilters.startDate
                              ? new Date(activeFilters.startDate)
                              : null
                          }
                          onChange={(date) => {
                            const formattedDate = date
                              ? date.toISOString().split("T")[0]
                              : null;
                            handleFilterChange("startDate", formattedDate);
                          }}
                          slotProps={{
                            textField: { size: "small", fullWidth: true },
                          }}
                        />
                      ) : (
                        <TextField
                          label="From Date"
                          size="small"
                          fullWidth
                          disabled
                        />
                      )}
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      {isClient ? (
                        <DatePicker
                          label="To Date"
                          value={
                            activeFilters.endDate
                              ? new Date(activeFilters.endDate)
                              : null
                          }
                          onChange={(date) => {
                            const formattedDate = date
                              ? date.toISOString().split("T")[0]
                              : null;
                            handleFilterChange("endDate", formattedDate);
                          }}
                          slotProps={{
                            textField: { size: "small", fullWidth: true },
                          }}
                        />
                      ) : (
                        <TextField
                          label="To Date"
                          size="small"
                          fullWidth
                          disabled
                        />
                      )}
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Grid>

              {/* Adult Content Filter */}
              <Grid size={{ xs: 12 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!activeFilters.adult}
                        onChange={(e) =>
                          handleFilterChange("adult", !e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Hide Adult Content"
                  />
                </FormGroup>
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ResetIcon />}
                    onClick={handleResetFilters}
                    size="small"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={handleApplyFilters}
                    color="primary"
                    size="small"
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  }

  // Desktop view of filters
  return (
    // <Paper
    //   elevation={3}
    //   sx={{
    //     p: 3,
    //     mb: 4,
    //     mt: 2,
    //     bgcolor: "transparent",
    //     backdropFilter: "blur(8px)",
    //   }}
    // >

    // </Paper>

    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mt: 2,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <FilterIcon sx={{ mr: 1 }} />
          Filters
          {activeFilterCount > 0 && (
            <Chip
              size="small"
              label={activeFilterCount}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ResetIcon />}
          onClick={handleResetFilters}
          size="small"
          sx={{
            color: "common.white",
          }}
        >
          Reset All
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={3} direction={"row"}>
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            {/* Type and Status Filters */}
            <Grid size={{ md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={activeFilters.type || ""}
                  onChange={(e) =>
                    handleFilterChange("type", e.target.value || null)
                  }
                  label="Type"
                >
                  <MenuItem value="">Any</MenuItem>
                  {TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={activeFilters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || null)
                  }
                  label="Status"
                >
                  <MenuItem value="">Any</MenuItem>
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Demographic and Score Filters */}
            <Grid size={{ md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Demographic</InputLabel>
                <Select
                  value={activeFilters.demographic || ""}
                  onChange={(e) =>
                    handleFilterChange("demographic", e.target.value || null)
                  }
                  label="Demographic"
                >
                  <MenuItem value="">Any</MenuItem>
                  {DEMOGRAPHIC_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Genre Filter */}
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Genres</InputLabel>
                <Select
                  multiple
                  value={activeFilters.genre || []}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  input={<OutlinedInput label="Genres" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            GENRE_OPTIONS.find(
                              (option) => option.value === value
                            )?.label || value
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                      },
                    },
                  }}
                >
                  {GENRE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Checkbox
                        checked={
                          (activeFilters.genre || []).indexOf(option.value) > -1
                        }
                      />
                      <ListItemText primary={option.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Grid container spacing={2}>
            {/* Date Filters */}
            <Grid size={{ xs: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {isClient ? (
                  <DatePicker
                    label="From Date"
                    value={
                      activeFilters.startDate
                        ? new Date(activeFilters.startDate)
                        : null
                    }
                    onChange={(date) => {
                      const formattedDate = date
                        ? date.toISOString().split("T")[0]
                        : null;
                      handleFilterChange("startDate", formattedDate);
                    }}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                ) : (
                  <TextField
                    label="From Date"
                    size="small"
                    fullWidth
                    disabled
                  />
                )}
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {isClient ? (
                  <DatePicker
                    label="To Date"
                    value={
                      activeFilters.endDate
                        ? new Date(activeFilters.endDate)
                        : null
                    }
                    onChange={(date) => {
                      const formattedDate = date
                        ? date.toISOString().split("T")[0]
                        : null;
                      handleFilterChange("endDate", formattedDate);
                    }}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                ) : (
                  <TextField label="To Date" size="small" fullWidth disabled />
                )}
              </LocalizationProvider>
            </Grid>

            {/* Adult Content Switch */}
            <Grid
              size={{ md: 2 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!activeFilters.adult}
                      onChange={(e) =>
                        handleFilterChange("adult", !e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Hide Adult Content"
                />
              </FormGroup>
            </Grid>

            {/* Score Filter */}
            <Grid
              size={{ md: 4 }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FormControl fullWidth>
                <Box display="flex" alignItems="center">
                  <Typography
                    variant="subtitle2"
                    sx={{ minWidth: 100, mr: 2 }}
                    gutterBottom
                  >
                    Min Score: {activeFilters.score || "Any"}
                  </Typography>
                  <Slider
                    value={activeFilters.score || 0}
                    onChange={(_, value) =>
                      handleFilterChange("score", value === 0 ? null : value)
                    }
                    step={1}
                    marks
                    min={0}
                    max={10}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => (value === 0 ? "Any" : value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 2 }}>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleApplyFilters}
                fullWidth
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default SearchFilters;
