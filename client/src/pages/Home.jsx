import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Box,
} from "@mui/material";
import Login from "./Login";
import Signup from "./Signup";
import hero from "../assets/hero.jpg"; // landscape hero image

const Home = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", pt: "80px" }}>
      <Container maxWidth="lg">
        {/* Heading and description above the image */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={600}
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#E76F51",
              mb: 2,
            }}
          >
            Welcome to Causeconnect!
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Work Sans', sans-serif",
              color: "#333",
              fontWeight: 700,
            }}
          >
            Connect with NGOs, participate in events, make donations, and support causes you care about.
          </Typography>
        </Box>

        {/* Hero Image */}
        <Box sx={{ width: "100%", mb: 4 }}>
          <Card
            sx={{
              width: "100%",
              height: { xs: 300, sm: 450, md: 550 },
              borderRadius: 2,
              boxShadow: 3,
              overflow: "hidden",
            }}
          >
            <img
              src={hero}
              alt="Hero"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </Card>
        </Box>

        {/* Buttons below the hero image */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 6 }}>
          <Button
            variant="contained"
            onClick={() => setOpenLogin(true)}
            sx={{
              backgroundColor: "#E76F51",
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Work Sans', sans-serif",
              textTransform: "none",
              borderRadius: "8px",
              py: 1.2,
              "&:hover": { backgroundColor: "#D65A3C" },
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenSignup(true)}
            sx={{
              backgroundColor: "#E76F51",
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Work Sans', sans-serif",
              textTransform: "none",
              borderRadius: "8px",
              py: 1.2,
              "&:hover": { backgroundColor: "#D65A3C" },
            }}
          >
            Sign Up
          </Button>
        </Box>

        {/* About / Info Cards */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
          {[
            {
              title: "Discover NGOs",
              desc: "Browse and explore a variety of NGOs and causes to support.",
            },
            {
              title: "Participate in Events",
              desc: "Join volunteering events and make a real impact in your community.",
            },
            {
              title: "Donate & Support",
              desc: "Contribute directly to causes and help NGOs achieve their mission.",
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  p: 3,
                  textAlign: "center",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                  borderRadius: 2,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ fontFamily: "'Work Sans', sans-serif", mb: 1 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#333",
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Login Dialog */}
        <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
          <DialogContent>
            <Login onSuccess={() => setOpenLogin(false)} />
          </DialogContent>
        </Dialog>

        {/* Signup Dialog */}
        <Dialog open={openSignup} onClose={() => setOpenSignup(false)}>
          <DialogContent>
            <Signup onSuccess={() => setOpenSignup(false)} />
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Home;
