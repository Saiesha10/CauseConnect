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
  SvgIcon,
  keyframes,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EventIcon from "@mui/icons-material/Event";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

import Login from "./Login";
import Signup from "./Signup";
import hero from "../assets/hero.jpg";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Home = () => {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  const infoCards = [
    {
      title: "Discover NGOs",
      desc: "Browse and explore a variety of NGOs and causes to support.",
      icon: FavoriteIcon,
    },
    {
      title: "Participate in Events",
      desc: "Join volunteering events and make a real impact in your community.",
      icon: EventIcon,
    },
    {
      title: "Donate & Support",
      desc: "Contribute directly to causes and help NGOs achieve their mission.",
      icon: VolunteerActivismIcon,
    },
  ];

  return (
    <Box sx={{ bgcolor: "#FDFCFB", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        component="section"
        sx={{
          position: "relative",
          height: { xs: "60vh", sm: "70vh", md: "80vh" },
          width: "100%",
          mb: { xs: 6, sm: 8 },
          borderRadius: { xs: 0, sm: 4 },
          boxShadow: {
            xs: "none",
            sm: "0px 10px 30px -5px rgba(0,0,0,0.2)",
          },
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          animation: `${fadeIn} 1.2s ease-out`,
        }}
      >
        <Box
          component="img"
          src={hero}
          alt="Volunteers working together"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            filter: "brightness(0.8)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            background:
              "linear-gradient(0deg, rgba(118, 100, 100, 0.3) 0%, rgba(51, 47, 47, 0.7) 100%)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 3,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: "90%",
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            fontWeight={800}
            sx={{
              mb: 2,
              textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
              fontSize: { xs: "2rem", sm: "3rem", md: "4rem", lg: "5rem" },
              animation: `${slideUp} 0.8s ease-out 0.2s backwards`,
            }}
          >
            Welcome to Causeconnect
          </Typography>
          <Typography
            variant="h5"
            sx={{
              maxWidth: { xs: "90%", sm: "750px" },
              mx: "auto",
              mb: 4,
              fontWeight: 400,
              textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
              animation: `${slideUp} 0.8s ease-out 0.4s backwards`,
            }}
          >
            Connect with NGOs, participate in events, make donations, and support
            causes you care about.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: { xs: 2, sm: 3 },
              flexDirection: { xs: "column", sm: "row" },
              animation: `${slideUp} 0.8s ease-out 0.6s backwards`,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => setOpenLogin(true)}
              sx={{
                bgcolor: "#e95f3dff",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "12px",
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 4, sm: 5 },
                transition: "all 0.3s ease",
                animation: `${pulse} 2s infinite ease-in-out`,
                "&:hover": {
                  bgcolor: "#D65A3C",
                  transform: "scale(1.08)",
                  boxShadow: "0 4px 15px rgba(231, 111, 81, 0.4)",
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setOpenSignup(true)}
              sx={{
                bgcolor: "#e95f3dff",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "12px",
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 4, sm: 5 },
                transition: "all 0.3s ease",
                animation: `${pulse} 2s infinite ease-in-out`,
                "&:hover": {
                  bgcolor: "#D65A3C",
                  transform: "scale(1.08)",
                  boxShadow: "0 4px 15px rgba(231, 111, 81, 0.4)",
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Impact Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, sm: 8 } }}>
        <Box
          component="section"
          sx={{
            textAlign: "center",
            mb: { xs: 6, sm: 8 },
            px: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            fontWeight={700}
            sx={{
              color: "#264653",
              mb: 2,
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
            }}
          >
            How You Can Make An Impact
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#585858",
              maxWidth: { xs: "100%", sm: "600px" },
              mx: "auto",
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Our platform provides multiple ways for you to get involved and
            contribute to meaningful causes.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {infoCards.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  height: "100%",
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px -5px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  animation: `${slideUp} 0.5s ease-out ${0.8 + idx * 0.2}s backwards`,
                  bgcolor: "#fff",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0px 8px 30px -5px rgba(231, 111, 81, 0.4)",
                    bgcolor: "#FEF8F5",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: { xs: 2, sm: 3 },
                  }}
                >
                  <SvgIcon
                    component={item.icon}
                    inheritViewBox
                    sx={{
                      color: "#E76F51",
                      fontSize: { xs: 40, sm: 50 },
                      mb: 2,
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  />
                  <Typography
                    variant="h6"
                    component="h3"
                    fontWeight={700}
                    sx={{
                      color: "#264653",
                      mb: 1,
                      fontSize: { xs: "1.2rem", sm: "1.4rem" },
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#585858",
                      lineHeight: 1.7,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Dialogs */}
      <Dialog
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 4, p: { xs: 1, sm: 2 } },
        }}
      >
        <DialogContent>
          <Login onSuccess={() => setOpenLogin(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 4, p: { xs: 1, sm: 2 } },
        }}
      >
        <DialogContent>
          <Signup onSuccess={() => setOpenSignup(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home;