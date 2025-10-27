import React from "react";
import { AppBar, Toolbar, Button, Box, Typography, keyframes } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import { gql, useQuery } from "@apollo/client";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: 1200,
  animation: `${slideDown} 0.5s ease-out`,
}));

const Spacer = styled("div")({
  height: { xs: "64px", sm: "80px" },
});

const navButtonStyle = {
  bgcolor: "#E76F51",
  color: "#fff",
  fontWeight: 700,
  textTransform: "none",
  fontFamily: "'Work Sans', sans-serif",
  borderRadius: "12px",
  px: { xs: 1.5, sm: 2.5 },
  py: { xs: 0.8, sm: 1 },
  fontSize: { xs: "0.85rem", sm: "1rem" },
  transition: "all 0.3s ease",
  "&:hover": {
    bgcolor: "#D65A3C",
    transform: "scale(1.05)",
    boxShadow: "0 6px 20px rgba(231, 111, 81, 0.4)",
  },
  "&:disabled": {
    bgcolor: "#B0BEC5",
    color: "#fff",
  },
};

const GET_USER_BY_ID = gql`
  query getUser($id: ID!) {
    user(id: $id) {
      id
      email
      full_name
      role
    }
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("cc_token");

  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.userId;
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  const { data, loading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  const role = data?.user?.role;

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    navigate("/login");
  };

  const dashboardRoute = role === "user" ? "/user-dashboard" : "/dashboard";

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@600;700&display=swap');`}
      </style>

      <StyledAppBar>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1, sm: 1.5 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": {
                transform: "scale(1.02)",
                transition: "transform 0.2s ease",
              },
            }}
            onClick={() => navigate("/")}
            aria-label="Navigate to homepage"
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
                color: "#264653",
              }}
            >
              CauseConnect
              <span
                style={{
                  color: "#E76F51",
                  fontSize: "inherit",
                  marginLeft: "4px",
                }}
              >
                .
              </span>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, flexWrap: "wrap" }}>
            <Button component={Link} to="/" variant="contained" sx={navButtonStyle} aria-label="Home">
              Home
            </Button>

            {token && (
              <Button
                component={Link}
                to="/ngos"
                variant="contained"
                sx={navButtonStyle}
                aria-label="NGO Listings"
              >
                NGO Listings
              </Button>
            )}

            {token && !loading && (
              <Button
                component={Link}
                to={dashboardRoute}
                variant="contained"
                sx={navButtonStyle}
                aria-label="Dashboard"
              >
                Dashboard
              </Button>
            )}

            {token && role === "organizer" && !loading && (
              <Button
                component={Link}
                to="/add-ngo"
                variant="contained"
                sx={navButtonStyle}
                aria-label="Add NGO"
              >
                Add NGO
              </Button>
            )}

            {!token ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={navButtonStyle}
                  aria-label="Login"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  sx={navButtonStyle}
                  aria-label="Sign Up"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogout}
                variant="contained"
                sx={{
                  ...navButtonStyle,
                  bgcolor: "#C62828",
                  "&:hover": {
                    bgcolor: "#B71C1C",
                    boxShadow: "0 6px 20px rgba(198, 40, 40, 0.4)",
                  },
                }}
                aria-label="Logout"
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Spacer />
    </>
  );
};

export default Navbar;