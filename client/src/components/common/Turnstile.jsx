import React, { useEffect, useCallback, useState, useRef } from "react";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

/**
 * A reusable Cloudflare Turnstile component
 */
const Turnstile = ({
  sitekey = "0x4AAAAAABdkuWDfpp2Sb6NR",
  onVerify,
  action = "login",
  theme: themeProp,
  size = "normal",
  id = "turnstile-widget",
  refreshOnError = true,
}) => {
  const muiTheme = useTheme();
  const theme =
    themeProp || (muiTheme.palette.mode === "dark" ? "dark" : "light");
  const widgetRef = useRef(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  const handleTurnstileCallback = useCallback(
    (token) => {
      // console.log(
      //   "Turnstile verified with token:",
      //   token ? "token received" : "no token"
      // );
      if (onVerify) onVerify(token);
    },
    [onVerify]
  );

  const handleTurnstileError = useCallback(() => {
    console.error("Turnstile error occurred");
    setWidgetError(true);

    if (refreshOnError) {
      setTimeout(() => {
        if (window.turnstile && widgetRef.current) {
          try {
            window.turnstile.reset(widgetRef.current);
            setWidgetError(false);
          } catch (e) {
            console.error("Failed to reset Turnstile:", e);
          }
        }
      }, 1000);
    }
  }, [refreshOnError]);

  useEffect(() => {
    const renderWidget = () => {
      if (!window.turnstile) {
        //console.log("Turnstile not loaded yet, retrying...");
        setTimeout(renderWidget, 500);
        return;
      }

      if (widgetRef.current?.hasChildNodes()) {
        //console.log("Turnstile already rendered, skipping.");
        setWidgetLoaded(true);
        return;
      }

      try {
        //console.log("Rendering Turnstile widget");

        window.turnstile.render(widgetRef.current, {
          sitekey,
          callback: handleTurnstileCallback,
          "error-callback": handleTurnstileError,
          theme,
          action,
          size,
        });

        setWidgetLoaded(true);
      } catch (error) {
        console.error("Failed to render Turnstile widget:", error);
        setWidgetError(true);
      }
    };

    renderWidget();

    return () => {
      setWidgetLoaded(false);
      setWidgetError(false);
      if (widgetRef.current) {
        widgetRef.current.innerHTML = ""; // Clean container on unmount
      }
    };
  }, [
    handleTurnstileCallback,
    handleTurnstileError,
    sitekey,
    theme,
    action,
    size,
  ]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        my: 2,
        minHeight: size === "normal" ? "70px" : "50px",
        position: "relative",
      }}
    >
      {!widgetLoaded && !widgetError && (
        <CircularProgress size={24} sx={{ my: 1 }} />
      )}

      {widgetError && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          Verification widget failed to load. Please refresh the page.
        </Typography>
      )}

      <div
        id={id}
        ref={widgetRef}
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      />
    </Box>
  );
};

export default Turnstile;
