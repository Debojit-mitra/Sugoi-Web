import React from "react";
import Head from "next/head";
import { Box, Container, Typography, Button } from "@mui/material";
import Layout from "../src/components/common/Layout";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Sugoi</title>
        <meta name="description" content="Page not found" />
      </Head>
      {/* We don't need to define the background here as it will be inherited from Layout */}
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: { xs: "100vh", md: "70vh" },
          textAlign: "center",
          position: "relative",
          zIndex: 1, // To make sure content is above the background
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", mt: 8 }}
        >
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: "600px", mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </Container>
    </>
  );
}
