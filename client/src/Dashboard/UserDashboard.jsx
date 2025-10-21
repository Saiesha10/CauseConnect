import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import DonationList from "../components/DonationList";
import EventList from "../components/EventList";
import FavoritesList from "../components/FavoritesList";
import ProfileSection from "../components/ProfileSection";

const UserDashboard = () => {
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
        User Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <DonationList />
      </Box>

      <Divider sx={{ mb: 4 }} />


      <Box sx={{ mb: 4 }}>
        <EventList user={true} />
      </Box>

      <Divider sx={{ mb: 4 }} />

 
      <Box sx={{ mb: 4 }}>
        <FavoritesList user={true} />
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ mb: 4 }}>
        <ProfileSection />
      </Box>
    </Box>
  );
};

export default UserDashboard;
