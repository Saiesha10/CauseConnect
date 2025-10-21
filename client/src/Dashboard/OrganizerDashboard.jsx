import React, { useState } from "react";
import { Box, Typography, Divider, Button, Stack } from "@mui/material";
import NGOList from "../components/NGOList";
import EventList from "../components/EventList";
import DonationList from "../components/DonationList";
import VolunteerList from "../components/VolunteerList";
import FavoritesList from "../components/FavoritesList";
import ProfileSection from "../components/ProfileSection";

const OrganizerDashboard = () => {
  const [activeSection, setActiveSection] = useState("ngos");


  const buttonStyle = (section) => ({
    backgroundColor: activeSection === section ? "#E76F51" : "#fff",
    color: activeSection === section ? "#fff" : "#0B0C10",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: activeSection === section ? "#D65A3C" : "#f0f0f0",
    },
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pt: "100px", bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 600,
          color: "#E76F51",
        }}
      >
        Organizer Dashboard
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: "wrap" }}>
        <Button sx={buttonStyle("ngos")} onClick={() => setActiveSection("ngos")}>
          My NGOs
        </Button>
        <Button sx={buttonStyle("events")} onClick={() => setActiveSection("events")}>
          Events
        </Button>
        <Button sx={buttonStyle("donors")} onClick={() => setActiveSection("donors")}>
          Donations
        </Button>
        <Button sx={buttonStyle("volunteers")} onClick={() => setActiveSection("volunteers")}>
          Volunteers
        </Button>
        <Button sx={buttonStyle("favorites")} onClick={() => setActiveSection("favorites")}>
          Favorites
        </Button>
        <Button sx={buttonStyle("profile")} onClick={() => setActiveSection("profile")}>
          Profile
        </Button>
      </Stack>

      <Divider sx={{ mb: 4 }} />

     
      <Box sx={{ mb: 4 }}>
        {activeSection === "ngos" && <NGOList organizer />}
        {activeSection === "events" && <EventList organizer />}
        {activeSection === "donors" && <DonationList organizer />}
        {activeSection === "volunteers" && <VolunteerList />}
        {activeSection === "favorites" && <FavoritesList organizer />}
        {activeSection === "profile" && <ProfileSection />}
      </Box>
    </Box>
  );
};

export default OrganizerDashboard;
