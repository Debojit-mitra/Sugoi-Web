// Helper function to get genre colors
export const getGenreColor = (genre, theme) => {
  const genreColors = {
    Action: theme.palette.purple[300],
    Adventure: theme.palette.secondary.light,
    Comedy: theme.palette.info.light,
    Drama: theme.palette.error.main,
    "Slice of Life": theme.palette.success.main,
    Fantasy: theme.palette.warning.main,
    Magic: theme.palette.secondary.light,
    Supernatural: theme.palette.secondary.dark,
    Horror: theme.palette.error.dark,
    Mystery: theme.palette.warning.main,
    Psychological: theme.palette.error.light,
    Romance: theme.palette.secondary.main,
    "Sci-Fi": theme.palette.info.main,
    Ecchi: theme.palette.warning.light,
  };

  return genreColors[genre] || theme.palette.primary.main;
};
