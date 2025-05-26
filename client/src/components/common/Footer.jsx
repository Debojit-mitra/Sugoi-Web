import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Footer sections
  const footerSections = [
    {
      title: "Explore",
      links: [
        { text: "Top Anime", href: "/anime/top" },
        { text: "Seasonal Anime", href: "/anime/season" },
        { text: "Schedule", href: "/anime/schedule" },
        { text: "Random Anime", href: "/anime/random" },
      ],
    },
    {
      title: "Account",
      links: [
        { text: "Login", href: "/auth/login" },
        { text: "Register", href: "/auth/register" },
        { text: "My Watchlist", href: "/user/watchlist" },
        { text: "Watch History", href: "/user/history" },
      ],
    },
    {
      title: "About Us",
      links: [
        { text: "About", href: "#" },
        { text: "Contact Us", href: "#" },
        { text: "Terms of Service", href: "#" },
        { text: "Privacy Policy", href: "#" },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: "auto",
        backgroundColor:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} justifyContent="space-between">
          {/* Logo and description */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: ".1rem",
                mb: 2,
              }}
            >
              SUGOI
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your ultimate anime streaming platform. Discover, track, and enjoy
              your favorite anime series and movies in one place.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="Instagram" color="primary">
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="Twitter" color="primary">
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="Facebook" color="primary">
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="GitHub" color="primary">
                <GitHubIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Footer Links Sections */}
          {footerSections.map((section) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={section.title}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                {section.title}
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                {section.links.map((link) => (
                  <Box component="li" key={link.text} sx={{ py: 0.5 }}>
                    <Link
                      href={link.href}
                      color="text.secondary"
                      sx={{
                        textDecoration: "none",
                        "&:hover": {
                          color: "primary.main",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {link.text}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} SUGOI. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Made with{" "}
            <FavoriteIcon
              sx={{ mx: 0.5, fontSize: "1rem", color: "error.main" }}
            />{" "}
            by Anime Enthusiasts
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
