// client/src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";

// Import Google Font
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/600.css";

const StyledAppBar = styled(AppBar)({
  background: "transparent",
  boxShadow: "none",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: 100,
});

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("cc_token");

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    navigate("/login");
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
            px: 4,
            py: 1,
            backgroundColor: "transparent",
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
                fontSize: "1.5rem",
                color: "#0B0C10",
                display: "flex",
                alignItems: "center",
              }}
            >
              Causeconnect
              <span
                style={{
                  color: "#E76F51", 
                  fontSize: "1.5rem",
                  lineHeight: 0,
                  marginLeft: "3px",
                }}
              >
                .
              </span>
            </Typography>
          </Box>

          
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={Link}
              to="/"
              variant="conatined"
              sx={{
                backgroundColor: "#E76F51",
                    color: "#fff",
                    fontWeight: 800,
                    textTransform: "none",
                    fontFamily: "'Work Sans', sans-serif",
                    mr: 1,
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#D65A3C" },
              }}
            >
              Home
            </Button>

            {!token ? (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    backgroundColor: "#E76F51",
                    color: "#fff",
                    fontWeight: 800,
                    textTransform: "none",
                    fontFamily: "'Work Sans', sans-serif",
                    mr: 1,
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#D65A3C" },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  sx={{
                    backgroundColor: "#E76F51",
                    color: "#fff",
                    fontWeight: 800,
                    textTransform: "none",
                    fontFamily: "'Work Sans', sans-serif",
                    borderRadius: "8px",
                    "&:hover": { backgroundColor: "#D65A3C" },
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Button
                onClick={handleLogout}
                sx={{
                  color: "#0B0C10",
                  fontWeight: 500,
                  textTransform: "none",
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>
    </>
  );
};

export default Navbar;
