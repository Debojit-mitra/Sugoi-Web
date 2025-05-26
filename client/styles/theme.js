import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

// Color palette
const purpleBase = {
  main: "#6200EA", // Deep purple
  light: "#B388FF", // Light purple
  dark: "#4A148C", // Dark purple
  contrastText: "#FFFFFF",
};

const primaryColors = {
  50: "#F3E5F5",
  100: "#E1BEE7",
  200: "#CE93D8",
  300: "#BA68C8",
  400: "#AB47BC",
  500: purpleBase.main,
  600: "#5E35B1",
  700: purpleBase.dark,
  800: "#4527A0",
  900: "#311B92",
  A100: "#B39DDB",
  A200: "#9575CD",
  A400: "#7E57C2",
  A700: "#673AB7",
};

// Create a theme instance for both light and dark modes
const getTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        ...purpleBase,
        ...(mode === "dark" && {
          main: "#9575CD", // Lighter purple for dark mode for better visibility
        }),
      },
      secondary: {
        main: "#FF4081", // Pink as secondary color
        light: "#FF80AB",
        dark: "#C51162",
        contrastText: "#FFFFFF",
      },
      error: {
        main: "#F44336",
      },
      warning: {
        main: "#FFA000",
      },
      info: {
        main: "#29B6F6",
      },
      success: {
        main: "#66BB6A",
      },
      background: {
        default: mode === "light" ? "#F5F5F5" : "#121212",
        paper: mode === "light" ? "#FFFFFF" : "#1E1E1E",
        alternate: mode === "light" ? "#EEEEEE" : "#2D2D2D",
      },
      text: {
        primary:
          mode === "light"
            ? "rgba(0, 0, 0, 0.87)"
            : "rgba(255, 255, 255, 0.87)",
        secondary:
          mode === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
      },
      divider:
        mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
      purple: primaryColors,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.5rem",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 500,
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
      },
      body1: {
        fontSize: "1rem",
      },
      body2: {
        fontSize: "0.875rem",
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            boxShadow:
              mode === "light" ? "0px 4px 8px rgba(0, 0, 0, 0.1)" : "none",
            padding: "8px 16px",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0px 6px 12px rgba(0, 0, 0, 0.15)"
                  : "0px 6px 12px rgba(0, 0, 0, 0.5)",
            },
          },
          containedPrimary: {
            background:
              mode === "light"
                ? `linear-gradient(45deg, ${purpleBase.main} 30%, ${purpleBase.light} 90%)`
                : `linear-gradient(45deg, ${purpleBase.dark} 30%, ${purpleBase.main} 90%)`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light"
                ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
                : "0px 4px 20px rgba(0, 0, 0, 0.5)",
            transition:
              "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow:
                mode === "light"
                  ? "0px 12px 28px rgba(0, 0, 0, 0.12)"
                  : "0px 12px 28px rgba(0, 0, 0, 0.7)",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0px 2px 10px rgba(0, 0, 0, 0.1)"
                : "0px 2px 10px rgba(0, 0, 0, 0.3)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0px 2px 10px rgba(0, 0, 0, 0.05)"
                : "0px 2px 10px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  });
};

export default getTheme;
