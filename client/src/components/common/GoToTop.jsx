import React, { useState, useEffect } from "react";
import { ArrowUpward } from "@mui/icons-material";
import { Fab, Zoom, Box } from "@mui/material";

const GoToTop = ({ threshold = 300, position = { right: 20, bottom: 20 } }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Zoom in={visible}>
      <Box
        onClick={scrollToTop}
        role="presentation"
        sx={{
          position: "fixed",
          ...position,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          sx={{
            opacity: 0.7,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <ArrowUpward />
        </Fab>
      </Box>
    </Zoom>
  );
};

export default GoToTop;
