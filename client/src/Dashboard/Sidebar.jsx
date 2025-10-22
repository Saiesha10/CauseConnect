import React, { useState, useEffect } from "react";
import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split("/").pop() || "profile";
  const [active, setActive] = useState(currentPath);

  useEffect(() => {
    setActive(currentPath);
  }, [location]);

  const menuItems =
    role === "organizer"
      ? [
          { text: "Profile", path: "profile" },
          { text: "My NGOs", path: "ngos" },
          { text: "My Events", path: "events" },
          { text: "My Donations", path: "donations" },
          { text: "My Volunteering", path: "volunteering" },
          { text: "Volunteers", path: "volunteers" },
          { text: "Favorites", path: "favorites" },
        ]
      : [
          { text: "Profile", path: "profile" },
          { text: "My Donations", path: "donations" },
          { text: "My Volunteering", path: "volunteering" },
          { text: "Favorites", path: "favorites" },
        ];

  const handleClick = (path) => {
    navigate(`/dashboard/${path}`);
    setActive(path);
  };

  return (
    <Box
      sx={{
        width: 220,
        bgcolor: "#E76F51",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, mb: 3, textAlign: "center" }}
      >
        Dashboard
      </Typography>
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleClick(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              bgcolor: active === item.path ? "#D65A3C" : "transparent",
              color: "#fff",
              "&:hover": { bgcolor: "#FF8C65", transform: "scale(1.02)" },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 600 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
