import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Navigate, Routes, Route } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

import Sidebar from "./Sidebar";
import ProfileSection from "../components/ProfileSection";
import DonationList from "../components/DonationList";
import EventList from "../components/EventList";
import NGOList from "../components/NGOList";
import VolunteerList from "../components/VolunteerList";

const GET_USER_BY_ID = gql`
  query getUser($id: ID!) {
    user(id: $id) {
      id
      full_name
      email
      role
      profile_picture
    }
  }
`;

const Dashboard = () => {
  const token = localStorage.getItem("cc_token");
  if (!token) return <Navigate to="/login" />;

  let userId = null;
  try {
    userId = JSON.parse(atob(token.split(".")[1])).userId;
  } catch (e) {
    console.error("Invalid token", e);
    return <Navigate to="/login" />;
  }

  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  if (loading)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <Typography variant="h6" color="error">
          Error fetching user data
        </Typography>
      </Box>
    );

  const role = data?.user?.role;

  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafa", minHeight: "100vh" }}>
      
      <Sidebar role={role} />

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Routes>
          <Route path="profile" element={<ProfileSection userId={userId} />} />

          {role === "organizer" ? (
            <>
              <Route path="ngos" element={<NGOList userId={userId} />} />
              <Route path="events" element={<EventList userId={userId} />} />
              <Route path="donors" element={<DonationList userId={userId} />} />
              <Route path="volunteers" element={<VolunteerList userId={userId} />} />
              <Route path="favorites" element={<NGOList userId={userId} favorites />} />
              <Route path="" element={<NGOList userId={userId} />} />
            </>
          ) : (
            <>
              <Route path="donations" element={<DonationList userId={userId} />} />
              <Route path="volunteering" element={<EventList userId={userId} />} />
              <Route path="favorites" element={<NGOList userId={userId} favorites />} />
              <Route path="" element={<DonationList userId={userId} />} />
            </>
          )}
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;
