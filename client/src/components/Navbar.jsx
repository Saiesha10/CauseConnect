
import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import { gql, useQuery } from "@apollo/client";

const StyledAppBar = styled(AppBar)({
  background: "white",
  boxShadow: "none",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: 100,
});

const Spacer = styled("div")({
  height: "80px",
});

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

  const navButtonStyle = {
    backgroundColor: "#E76F51",
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    fontFamily: "'Work Sans', sans-serif",
    borderRadius: "8px",
    px: 2.5,
    "&:hover": { backgroundColor: "#D65A3C" },
  };

  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@600&display=swap');`}
      </style>

      <StyledAppBar>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 4 },
            py: 1,
          }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 600,
                fontSize: "1.6rem",
                color: "#0B0C10",
              }}
            >
              CauseConnect
              <span
                style={{
                  color: "#E76F51",
                  fontSize: "1.6rem",
                  marginLeft: "3px",
                }}
              >
                .
              </span>
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button component={Link} to="/" variant="contained" sx={navButtonStyle}>
              Home
            </Button>

            {token && (
              <Button component={Link} to="/ngos" variant="contained" sx={navButtonStyle}>
                NGO Listings
              </Button>
            )}

      
            {token && !loading && (
              <Button component={Link} to="/dashboard" variant="contained" sx={navButtonStyle}>
                Dashboard
              </Button>
            )}

      
            {token && role === "organizer" && !loading && (
              <Button component={Link} to="/add-ngo" variant="contained" sx={navButtonStyle}>
                Add NGO
              </Button>
            )}

            {!token ? (
              <>
                <Button component={Link} to="/login" variant="contained" sx={navButtonStyle}>
                  Login
                </Button>
                <Button component={Link} to="/signup" variant="contained" sx={navButtonStyle}>
                  Sign Up
                </Button>
              </>
            ) : (
              <Button onClick={handleLogout} variant="contained" sx={navButtonStyle}>
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
