import React from "react";
import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  const menuItems =
    role === "organizer"
      ? [
          { text: "My NGOs", path: "ngos" },
          { text: "My Events", path: "events" },
          { text: "Donors", path: "donors" },
          { text: "Volunteers", path: "volunteers" },
          { text: "Favorites", path: "favorites" },
          { text: "Profile", path: "profile" },
        ]
      : [
          { text: "My Donations", path: "donations" },
          { text: "My Volunteering", path: "volunteering" },
          { text: "Favorites", path: "favorites" },
          { text: "Profile", path: "profile" },
        ];

  return (
    <Box sx={{ width: 240, bgcolor: "#fff", boxShadow: 2, height: "100vh", p: 2 }}>
      <Typography
        variant="h5"
        sx={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 600, color: "#E76F51", mb: 3 }}
      >
        Dashboard
      </Typography>
      <List>
        {menuItems.map((item, idx) => (
          <ListItemButton key={idx} onClick={() => navigate(item.path)}>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
